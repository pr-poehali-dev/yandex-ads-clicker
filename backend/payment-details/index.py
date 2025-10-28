'''
Business: API для управления реквизитами платежей (CRUD)
Args: event - dict с httpMethod, body, queryStringParameters
      context - object с attributes: request_id, function_name
Returns: HTTP response dict
'''

import json
import os
from typing import Dict, Any
import psycopg2

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    database_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(database_url)
    
    if method == 'GET':
        query_params = event.get('queryStringParameters', {}) or {}
        detail_id = query_params.get('id')
        
        if detail_id:
            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT id, recipient_name, account_number, currency, is_active, created_at FROM payment_details WHERE id = {detail_id}"
                )
                row = cur.fetchone()
                
                if row:
                    detail = {
                        'id': row[0],
                        'recipient_name': row[1],
                        'account_number': row[2],
                        'currency': row[3],
                        'is_active': row[4],
                        'created_at': row[5].isoformat() if row[5] else None
                    }
                    conn.close()
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps(detail),
                        'isBase64Encoded': False
                    }
        
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, recipient_name, account_number, currency, is_active, created_at FROM payment_details ORDER BY created_at DESC"
            )
            rows = cur.fetchall()
            
            details = [{
                'id': row[0],
                'recipient_name': row[1],
                'account_number': row[2],
                'currency': row[3],
                'is_active': row[4],
                'created_at': row[5].isoformat() if row[5] else None
            } for row in rows]
            
        conn.close()
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(details),
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        recipient_name = body_data.get('recipient_name', '').replace("'", "''")
        account_number = body_data.get('account_number', '').replace("'", "''")
        currency = body_data.get('currency', 'CNY').replace("'", "''")
        
        with conn.cursor() as cur:
            cur.execute(
                f"INSERT INTO payment_details (recipient_name, account_number, currency, is_active) VALUES ('{recipient_name}', '{account_number}', '{currency}', true) RETURNING id, recipient_name, account_number, currency, is_active, created_at"
            )
            row = cur.fetchone()
            conn.commit()
            
            detail = {
                'id': row[0],
                'recipient_name': row[1],
                'account_number': row[2],
                'currency': row[3],
                'is_active': row[4],
                'created_at': row[5].isoformat() if row[5] else None
            }
        
        conn.close()
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(detail),
            'isBase64Encoded': False
        }
    
    if method == 'PUT':
        body_data = json.loads(event.get('body', '{}'))
        detail_id = body_data.get('id')
        recipient_name = body_data.get('recipient_name', '').replace("'", "''")
        account_number = body_data.get('account_number', '').replace("'", "''")
        currency = body_data.get('currency', '').replace("'", "''")
        is_active = body_data.get('is_active', True)
        
        with conn.cursor() as cur:
            cur.execute(
                f"UPDATE payment_details SET recipient_name = '{recipient_name}', account_number = '{account_number}', currency = '{currency}', is_active = {is_active}, updated_at = NOW() WHERE id = {detail_id} RETURNING id, recipient_name, account_number, currency, is_active, created_at"
            )
            row = cur.fetchone()
            conn.commit()
            
            if row:
                detail = {
                    'id': row[0],
                    'recipient_name': row[1],
                    'account_number': row[2],
                    'currency': row[3],
                    'is_active': row[4],
                    'created_at': row[5].isoformat() if row[5] else None
                }
                conn.close()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(detail),
                    'isBase64Encoded': False
                }
        
        conn.close()
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Payment detail not found'}),
            'isBase64Encoded': False
        }
    
    if method == 'DELETE':
        query_params = event.get('queryStringParameters', {}) or {}
        detail_id = query_params.get('id')
        
        with conn.cursor() as cur:
            cur.execute(f"DELETE FROM payment_details WHERE id = {detail_id}")
            conn.commit()
        
        conn.close()
        return {
            'statusCode': 204,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': '',
            'isBase64Encoded': False
        }
    
    conn.close()
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
