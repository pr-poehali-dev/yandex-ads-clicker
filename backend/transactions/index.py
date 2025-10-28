'''
Business: API для управления транзакциями пополнения
Args: event - dict с httpMethod, body, queryStringParameters
      context - object с attributes: request_id, function_name
Returns: HTTP response dict
'''

import json
import os
from typing import Dict, Any
import psycopg2

CNY_TO_RUB_RATE = 11.40

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    database_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(database_url)
    
    if method == 'GET':
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT t.id, t.amount, t.currency, t.amount_cny, t.status, 
                       t.created_at, pd.recipient_name, pd.account_number
                FROM transactions t
                LEFT JOIN payment_details pd ON t.payment_detail_id = pd.id
                ORDER BY t.created_at DESC
                """
            )
            rows = cur.fetchall()
            
            transactions = [{
                'id': row[0],
                'amount': float(row[1]),
                'currency': row[2],
                'amount_cny': float(row[3]),
                'status': row[4],
                'date': row[5].isoformat() if row[5] else None,
                'payment_details': {
                    'recipient_name': row[6],
                    'account_number': row[7]
                } if row[6] else None
            } for row in rows]
        
        conn.close()
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(transactions),
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        amount = float(body_data.get('amount'))
        currency = body_data.get('currency', 'CNY').replace("'", "''")
        
        amount_cny = amount if currency == 'CNY' else round(amount / CNY_TO_RUB_RATE, 2)
        
        with conn.cursor() as cur:
            cur.execute(
                f"SELECT id FROM payment_details WHERE is_active = true AND currency = '{currency}' LIMIT 1"
            )
            row = cur.fetchone()
            payment_detail_id = row[0] if row else None
            
            if not payment_detail_id:
                cur.execute(
                    "SELECT id FROM payment_details WHERE is_active = true LIMIT 1"
                )
                row = cur.fetchone()
                payment_detail_id = row[0] if row else None
            
            if payment_detail_id:
                cur.execute(
                    f"INSERT INTO transactions (amount, currency, amount_cny, status, payment_detail_id) VALUES ({amount}, '{currency}', {amount_cny}, 'pending', {payment_detail_id}) RETURNING id, amount, currency, amount_cny, status, created_at"
                )
            else:
                cur.execute(
                    f"INSERT INTO transactions (amount, currency, amount_cny, status) VALUES ({amount}, '{currency}', {amount_cny}, 'pending') RETURNING id, amount, currency, amount_cny, status, created_at"
                )
            
            row = cur.fetchone()
            conn.commit()
            
            transaction = {
                'id': row[0],
                'amount': float(row[1]),
                'currency': row[2],
                'amount_cny': float(row[3]),
                'status': row[4],
                'date': row[5].isoformat() if row[5] else None
            }
            
            if payment_detail_id:
                cur.execute(
                    f"SELECT recipient_name, account_number FROM payment_details WHERE id = {payment_detail_id}"
                )
                pd_row = cur.fetchone()
                transaction['payment_details'] = {
                    'recipient_name': pd_row[0],
                    'account_number': pd_row[1]
                } if pd_row else None
        
        conn.close()
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(transaction),
            'isBase64Encoded': False
        }
    
    if method == 'PUT':
        body_data = json.loads(event.get('body', '{}'))
        transaction_id = body_data.get('id')
        status = body_data.get('status', '').replace("'", "''")
        
        with conn.cursor() as cur:
            cur.execute(
                f"UPDATE transactions SET status = '{status}', updated_at = NOW() WHERE id = {transaction_id} RETURNING id, amount, currency, status, created_at"
            )
            row = cur.fetchone()
            conn.commit()
            
            if row:
                transaction = {
                    'id': row[0],
                    'amount': float(row[1]),
                    'currency': row[2],
                    'status': row[3],
                    'date': row[4].isoformat() if row[4] else None
                }
                conn.close()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(transaction),
                    'isBase64Encoded': False
                }
        
        conn.close()
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Transaction not found'}),
            'isBase64Encoded': False
        }
    
    conn.close()
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }