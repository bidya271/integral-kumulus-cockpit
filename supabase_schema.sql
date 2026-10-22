-- ====================================================================
-- KUMULUS INSURANCE - MOTOR CLAIMS DATABASE SCHEMA
-- Target Database: PostgreSQL 15+ / Supabase
-- Architecture: GoBD & VVG Compliant Auditability & Event Tracking
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Coverage Enum
CREATE TYPE coverage_type AS ENUM ('Haftpflicht', 'Teilkasko', 'Vollkasko');
CREATE TYPE claim_channel AS ENUM ('app', 'email', 'voice', 'whatsapp', 'phone', 'system', 'sms');
CREATE TYPE claim_status AS ENUM (
    'new', 
    'waiting_on_customer', 
    'waiting_on_assessor', 
    'waiting_on_shop', 
    'approval_requested', 
    'in_review', 
    'payout_pending', 
    'reopened', 
    'closed', 
    'merged'
);
CREATE TYPE ai_draft_status AS ENUM ('pending', 'sent_unchanged', 'edited', 'discarded', 'quarantined');
CREATE TYPE rule_severity AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE decision_mode AS ENUM ('AUTONOMOUS', 'HUMAN_REVIEW_REQUIRED', 'URGENT_DEADLINE');

-- 3. Policies Table
CREATE TABLE policies (
    policy_id VARCHAR(50) PRIMARY KEY,
    holder_name VARCHAR(255) NOT NULL,
    holder_title VARCHAR(50),
    holder_email VARCHAR(255),
    holder_phone VARCHAR(100),
    plate VARCHAR(50) NOT NULL,
    vehicle VARCHAR(255) NOT NULL,
    vehicle_year INT,
    coverage coverage_type NOT NULL,
    deductible_teilkasko_eur NUMERIC(10, 2) DEFAULT 0.00,
    deductible_vollkasko_eur NUMERIC(10, 2) DEFAULT 0.00,
    mobility_cover BOOLEAN DEFAULT FALSE,
    policy_start DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_policies_plate ON policies(plate);
CREATE INDEX idx_policies_phone ON policies(holder_phone);
CREATE INDEX idx_policies_email ON policies(holder_email);

-- 4. Claims Table
CREATE TABLE claims (
    claim_id VARCHAR(50) PRIMARY KEY,
    opened_at TIMESTAMPTZ NOT NULL,
    channel claim_channel NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_date TIMESTAMPTZ,
    policy_id VARCHAR(50) REFERENCES policies(policy_id),
    reported_name VARCHAR(255),
    reported_plate VARCHAR(50),
    reported_phone VARCHAR(100),
    reported_email VARCHAR(255),
    location VARCHAR(255),
    intake_summary TEXT,
    status claim_status NOT NULL DEFAULT 'new',
    last_activity_at TIMESTAMPTZ,
    notes TEXT,
    pending_draft_id VARCHAR(50),
    assigned_to VARCHAR(100) DEFAULT 'Lena Huber',
    -- Reconciled and Augmented Fields
    resolved_policy_id VARCHAR(50) REFERENCES policies(policy_id),
    is_storm_claim BOOLEAN DEFAULT FALSE,
    is_duplicate BOOLEAN DEFAULT FALSE,
    merged_into_claim_id VARCHAR(50) REFERENCES claims(claim_id),
    decision_mode decision_mode DEFAULT 'HUMAN_REVIEW_REQUIRED',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_claims_status ON claims(status);
CREATE INDEX idx_claims_policy ON claims(resolved_policy_id);
CREATE INDEX idx_claims_storm ON claims(is_storm_claim);
CREATE INDEX idx_claims_opened ON claims(opened_at);

-- 5. Messages Table
CREATE TABLE messages (
    message_id VARCHAR(50) PRIMARY KEY,
    claim_id VARCHAR(50) REFERENCES claims(claim_id) ON DELETE CASCADE,
    sent_at TIMESTAMPTZ NOT NULL,
    channel claim_channel NOT NULL,
    direction VARCHAR(20) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    author VARCHAR(255) NOT NULL,
    sender_address VARCHAR(255),
    recipient_address VARCHAR(255),
    subject VARCHAR(255),
    body TEXT,
    attachment_count INT DEFAULT 0,
    read_by_customer_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_claim ON messages(claim_id);
CREATE INDEX idx_messages_sent ON messages(sent_at);

-- 6. Attachments Table
CREATE TABLE attachments (
    attachment_id VARCHAR(50) PRIMARY KEY,
    message_id VARCHAR(50) REFERENCES messages(message_id) ON DELETE CASCADE,
    claim_id VARCHAR(50) REFERENCES claims(claim_id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    size_kb INT,
    uploaded_at TIMESTAMPTZ NOT NULL,
    storage_url TEXT
);

CREATE INDEX idx_attachments_claim ON attachments(claim_id);

-- 7. AI Drafts Table
CREATE TABLE ai_drafts (
    draft_id VARCHAR(50) PRIMARY KEY,
    claim_id VARCHAR(50) REFERENCES claims(claim_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL,
    in_reply_to VARCHAR(50),
    reply_channel claim_channel NOT NULL,
    status ai_draft_status NOT NULL DEFAULT 'pending',
    draft_text TEXT NOT NULL,
    sent_text TEXT,
    sent_at TIMESTAMPTZ,
    handled_by VARCHAR(100),
    quarantine_reason TEXT,
    created_at_ts TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_drafts_claim ON ai_drafts(claim_id);
CREATE INDEX idx_drafts_status ON ai_drafts(status);

-- 8. Voice Calls & Transcripts
CREATE TABLE voice_calls (
    call_id VARCHAR(50) PRIMARY KEY,
    claim_id VARCHAR(50) REFERENCES claims(claim_id) ON DELETE SET NULL,
    started_at TIMESTAMPTZ NOT NULL,
    duration_seconds INT,
    caller_phone VARCHAR(100),
    captured_name VARCHAR(255),
    captured_plate VARCHAR(50),
    captured_policy_id VARCHAR(50),
    captured_location VARCHAR(255),
    captured_damage TEXT
);

CREATE TABLE voice_transcripts (
    id BIGSERIAL PRIMARY KEY,
    call_id VARCHAR(50) REFERENCES voice_calls(call_id) ON DELETE CASCADE,
    t_seconds INT NOT NULL,
    speaker VARCHAR(50) NOT NULL,
    text TEXT NOT NULL
);

CREATE INDEX idx_transcripts_call ON voice_transcripts(call_id);

-- 9. Business Rule Execution & Audit Log (GoBD Compliance)
CREATE TABLE rule_audit_log (
    audit_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id VARCHAR(50) REFERENCES claims(claim_id) ON DELETE CASCADE,
    rule_code VARCHAR(50) NOT NULL, -- e.g. RULE_1_COVERAGE, RULE_3_WORKSHOP, RULE_4_DEDUP
    rule_name VARCHAR(255) NOT NULL,
    evaluated_at TIMESTAMPTZ DEFAULT NOW(),
    decision decision_mode NOT NULL,
    trigger_evidence JSONB NOT NULL,
    action_taken VARCHAR(255) NOT NULL,
    operator VARCHAR(100) DEFAULT 'Lena Huber'
);

CREATE INDEX idx_audit_claim ON rule_audit_log(claim_id);
CREATE INDEX idx_audit_rule ON rule_audit_log(rule_code);
