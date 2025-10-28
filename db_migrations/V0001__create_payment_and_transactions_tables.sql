CREATE TABLE IF NOT EXISTS payment_details (
    id SERIAL PRIMARY KEY,
    recipient_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(255) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'CNY',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'CNY',
    amount_cny DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    payment_detail_id INTEGER REFERENCES payment_details(id),
    qr_code_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO payment_details (recipient_name, account_number, currency, is_active)
VALUES ('Zhang Wei', '+86 138 0013 8000', 'CNY', true);

CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_payment_details_active ON payment_details(is_active);
