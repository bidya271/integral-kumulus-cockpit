import openpyxl
import pandas as pd
import json
import os

excel_path = '/Users/bidya/Documents/rojgar/integral_case_study/Data Pack/Kumulus - Claims Export 14 July 2026.xlsx'
output_path = '/Users/bidya/Documents/rojgar/integral-claims-cockpit/src/data/kumulus_seed.json'

print("Loading Excel workbook...")

def load_sheet_to_records(sheet_name):
    df = pd.read_excel(excel_path, sheet_name=sheet_name)
    # Convert all NaN to None/empty
    records = []
    for r in df.to_dict(orient='records'):
        clean_r = {}
        for k, v in r.items():
            if pd.isna(v):
                clean_r[k] = None
            else:
                clean_r[k] = v
        records.append(clean_r)
    return records

claims_records = load_sheet_to_records('claims')
policies_records = load_sheet_to_records('policies')
messages_records = load_sheet_to_records('messages')
attachments_records = load_sheet_to_records('attachments')
ai_drafts_records = load_sheet_to_records('ai_drafts')
voice_calls_records = load_sheet_to_records('voice_calls')
transcripts_records = load_sheet_to_records('voice_transcripts')

# Build policy lookup maps
plate_to_pol = {r['plate']: r['policy_id'] for r in policies_records if r.get('plate')}
phone_to_pol = {r['holder_phone']: r['policy_id'] for r in policies_records if r.get('holder_phone')}
email_to_pol = {r['holder_email']: r['policy_id'] for r in policies_records if r.get('holder_email')}
policy_by_id = {r['policy_id']: r for r in policies_records}

# Reconcile claims
claims_list = []
unlinked_count = 0
resolved_unlinked_count = 0

for c in claims_records:
    orig_pol = c.get('policy_id')
    resolved_pol = orig_pol
    match_source = 'original'
    
    if not orig_pol:
        unlinked_count += 1
        plate = c.get('reported_plate')
        phone = c.get('reported_phone')
        email = c.get('reported_email')
        
        if plate and plate in plate_to_pol:
            resolved_pol = plate_to_pol[plate]
            match_source = 'matched_plate'
        elif phone and phone in phone_to_pol:
            resolved_pol = phone_to_pol[phone]
            match_source = 'matched_phone'
        elif email and email in email_to_pol:
            resolved_pol = email_to_pol[email]
            match_source = 'matched_email'
            
        if resolved_pol:
            resolved_unlinked_count += 1
            
    c['resolved_policy_id'] = resolved_pol
    c['match_source'] = match_source
    c['is_storm_claim'] = str(c.get('opened_at', '')) >= '2026-07-13 18:00'
    claims_list.append(c)

# Deduplication detection across storm claims
policy_claim_map = {}
for c in claims_list:
    if c['is_storm_claim'] and c.get('resolved_policy_id'):
        policy_claim_map.setdefault(c['resolved_policy_id'], []).append(c)

duplicate_pairs_count = 0
for pol_id, group in policy_claim_map.items():
    if len(group) > 1:
        duplicate_pairs_count += 1
        group.sort(key=lambda x: str(x.get('opened_at', '')))
        primary_claim = group[0]['claim_id']
        for idx, item in enumerate(group):
            if idx == 0:
                item['is_duplicate'] = False
                item['has_duplicates'] = True
                item['duplicate_claim_ids'] = [g['claim_id'] for g in group[1:]]
            else:
                item['is_duplicate'] = True
                item['duplicate_of_claim_id'] = primary_claim
                item['has_duplicates'] = False
                item['duplicate_claim_ids'] = []
    else:
        group[0]['is_duplicate'] = False
        group[0]['has_duplicates'] = False
        group[0]['duplicate_claim_ids'] = []

for c in claims_list:
    if 'is_duplicate' not in c:
        c['is_duplicate'] = False
        c['has_duplicates'] = False
        c['duplicate_claim_ids'] = []

# Detect glass, water, mobility, haftpflicht, workshop deadline
for c in claims_list:
    text = (str(c.get('intake_summary') or '') + ' ' + str(c.get('notes') or '')).lower()
    
    pol = policy_by_id.get(c.get('resolved_policy_id'), {})
    coverage = pol.get('coverage') or ''
    mobility = pol.get('mobility_cover') or 'no'
    
    has_glass = any(k in text for k in ['glass', 'windscreen', 'windshield', 'window', 'scheibe', 'glas', 'sunroof', 'panoramadach'])
    has_water = any(k in text for k in ['water', 'rain', 'regen', 'wasser', 'leak', 'wet'])
    is_undrivable = any(k in text for k in ['undrivable', 'not drivable', 'drivable: no', 'cannot be driven', 'fahrbereit: nein'])
    
    anomalies = []
    
    if c['claim_id'] == 'KS-26-104234':
        anomalies.append({
            'code': 'WORKSHOP_DEADLINE',
            'severity': 'CRITICAL',
            'title': 'Autohaus Brandl 12:00 Deadline',
            'description': 'Cost estimate €3,860 net is within Dekra €3,910. Repair slot today 13:00 expires at 12:00.'
        })
    elif c['claim_id'] == 'KS-26-104413':
        anomalies.append({
            'code': 'MOBILITY_OVERAGE',
            'severity': 'CRITICAL',
            'title': 'Mobility Rule 14-Day Limit',
            'description': 'Customer requested rental extension to July 22 (21 days). AI promised free extension, which violates Rule 7. Needs Team Lead written approval.'
        })
    elif c['status'] == 'reopened':
        anomalies.append({
            'code': 'REOPENED_NOISE',
            'severity': 'LOW',
            'title': 'False Reopened Claim',
            'description': 'Customer replied with a simple thank you after full payout/settlement. Ready to archive.'
        })
    elif c['is_duplicate']:
        anomalies.append({
            'code': 'DUPLICATE_SUBMISSION',
            'severity': 'MEDIUM',
            'title': f"Duplicate of {c.get('duplicate_of_claim_id')}",
            'description': 'Customer submitted twice across different channels (e.g. voice and app). Ready to merge.'
        })
    elif c['is_storm_claim'] and coverage == 'Haftpflicht':
        anomalies.append({
            'code': 'HAFTPFLICHT_HAZARD',
            'severity': 'CRITICAL',
            'title': 'Liability Only (No Hail Cover)',
            'description': 'Policy only has Haftpflicht. Hail is NOT covered. Naive AI draft falsely promised payout.'
        })
    elif has_glass or has_water or is_undrivable:
        anomalies.append({
            'code': 'GLASS_WATER_HAZARD',
            'severity': 'HIGH',
            'title': 'Glass / Water Damage (Rule 5)',
            'description': 'Car must not be driven. Requires instant Klarsicht Autoglas mobile on-site dispatch.'
        })

    c['anomalies'] = anomalies
    c['has_glass'] = has_glass
    c['has_water'] = has_water
    c['is_undrivable'] = is_undrivable
    c['policy_coverage'] = coverage
    c['mobility_cover'] = mobility
    c['deductible_teilkasko_eur'] = pol.get('deductible_teilkasko_eur')
    c['deductible_vollkasko_eur'] = pol.get('deductible_vollkasko_eur')
    c['holder_name'] = pol.get('holder_name')
    c['vehicle'] = pol.get('vehicle')
    c['vehicle_year'] = pol.get('vehicle_year')

output_data = {
    'metadata': {
        'snapshot_time': '2026-07-14 07:45',
        'handler_name': 'Lena Huber',
        'total_claims': len(claims_list),
        'storm_claims_count': sum(1 for c in claims_list if c['is_storm_claim']),
        'pre_storm_claims_count': sum(1 for c in claims_list if not c['is_storm_claim']),
        'unlinked_at_intake_count': unlinked_count,
        'unlinked_resolved_count': resolved_unlinked_count,
        'duplicate_pairs_count': duplicate_pairs_count,
        'duplicate_claims_count': sum(1 for c in claims_list if c.get('is_duplicate')),
        'haftpflicht_storm_count': sum(1 for c in claims_list if c['is_storm_claim'] and c.get('policy_coverage') == 'Haftpflicht'),
        'glass_storm_count': sum(1 for c in claims_list if c['is_storm_claim'] and c.get('has_glass')),
    },
    'claims': claims_list,
    'policies': policies_records,
    'messages': messages_records,
    'attachments': attachments_records,
    'ai_drafts': ai_drafts_records,
    'voice_calls': voice_calls_records,
    'voice_transcripts': transcripts_records
}

os.makedirs(os.path.dirname(output_path), exist_ok=True)
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(output_data, f, ensure_ascii=False, indent=2)

print(f"Data exported successfully to {output_path}")
print(f"Stats: {output_data['metadata']}")
