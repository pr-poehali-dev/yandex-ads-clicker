'''
Business: Обработка webhook от Telegram бота для кнопок подтверждения/отклонения платежей
Args: event - dict с httpMethod, body (callback_query от Telegram)
      context - object с request_id
Returns: HTTP response dict
'''
import json
import os
import psycopg2
from typing import Dict, Any
import requests

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    # Handle CORS OPTIONS request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    
    # Проверяем, есть ли callback_query от нажатия на кнопку
    if 'callback_query' in body_data:
        callback = body_data['callback_query']
        callback_id = callback['id']
        callback_data = callback['data']
        chat_id = callback['message']['chat']['id']
        message_id = callback['message']['message_id']
        
        # Разбираем данные кнопки: "approve_123" или "reject_123"
        action, transaction_id = callback_data.split('_')
        
        # Подключаемся к базе данных
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cursor = conn.cursor()
        
        # Обновляем статус транзакции
        if action == 'approve':
            new_status = 'completed'
            status_text = '✅ Оплата получена'
        else:
            new_status = 'failed'
            status_text = '❌ Платёж отказан'
        
        cursor.execute(
            "UPDATE transactions SET status = %s WHERE id = %s",
            (new_status, int(transaction_id))
        )
        conn.commit()
        
        # Получаем токен бота
        bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
        
        # Отвечаем на callback_query (убирает "часики" на кнопке)
        requests.post(
            f"https://api.telegram.org/bot{bot_token}/answerCallbackQuery",
            json={
                'callback_query_id': callback_id,
                'text': f'{status_text}'
            }
        )
        
        # Редактируем сообщение, удаляя кнопки
        requests.post(
            f"https://api.telegram.org/bot{bot_token}/editMessageReplyMarkup",
            json={
                'chat_id': chat_id,
                'message_id': message_id,
                'reply_markup': {'inline_keyboard': []}
            }
        )
        
        # Отправляем новое сообщение с результатом
        requests.post(
            f"https://api.telegram.org/bot{bot_token}/sendMessage",
            json={
                'chat_id': chat_id,
                'text': f'{status_text}\n\nTransaction ID: {transaction_id}'
            }
        )
        
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'ok': True})
        }
    
    # Если это не callback_query, просто отвечаем OK (для проверки webhook)
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'ok': True})
    }
