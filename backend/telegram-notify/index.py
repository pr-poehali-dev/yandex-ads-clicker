'''
Business: Отправка скриншотов оплаты в Telegram бот
Args: event - dict с httpMethod, body (base64 изображение, chat_id, amount, currency)
      context - object с request_id
Returns: HTTP response dict с результатом отправки
'''
import json
import os
import base64
import requests
from typing import Dict, Any

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
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        
        # Получаем данные из запроса
        image_base64 = body_data.get('image')
        chat_id = body_data.get('chat_id', '-1003174200950')  # ID чата куда отправлять
        amount = body_data.get('amount', '')
        currency = body_data.get('currency', 'CNY')
        
        if not image_base64:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Image is required'})
            }
        
        # Получаем токен бота из секретов
        bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
        if not bot_token:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Bot token not configured'})
            }
        
        # Декодируем base64 изображение
        # Убираем префикс data:image/...;base64, если есть
        if ',' in image_base64:
            image_base64 = image_base64.split(',')[1]
        
        image_bytes = base64.b64decode(image_base64)
        
        # Получаем тип изображения
        image_type = body_data.get('type', 'qr_code')
        transaction_id = body_data.get('transaction_id', 'N/A')
        
        # Формируем сообщение в зависимости от типа
        if image_type == 'payment_proof':
            caption = f"✅ Скриншот оплаты\n\n"
            caption += f"Сумма: {amount} {currency}\n"
            caption += f"Transaction ID: {transaction_id}\n"
            caption += f"Request ID: {context.request_id}"
        else:
            caption = f"💰 Новая заявка на пополнение (QR-код)\n\n"
            caption += f"Сумма: {amount} {currency}\n"
            caption += f"Transaction ID: {transaction_id}\n"
            caption += f"Request ID: {context.request_id}"
        
        # Отправляем фото в Telegram
        telegram_url = f"https://api.telegram.org/bot{bot_token}/sendPhoto"
        
        files = {
            'photo': ('screenshot.jpg', image_bytes, 'image/jpeg')
        }
        data = {
            'chat_id': chat_id,
            'caption': caption
        }
        
        # Добавляем кнопки только для скриншотов оплаты
        if image_type == 'payment_proof' and transaction_id != 'N/A':
            reply_markup = {
                'inline_keyboard': [[
                    {
                        'text': '✅ Оплата получена',
                        'callback_data': f'approve_{transaction_id}'
                    },
                    {
                        'text': '❌ Платёж отказан',
                        'callback_data': f'reject_{transaction_id}'
                    }
                ]]
            }
            data['reply_markup'] = json.dumps(reply_markup)
        
        response = requests.post(telegram_url, files=files, data=data, timeout=10)
        
        if response.status_code == 200:
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({
                    'success': True,
                    'message': 'Screenshot sent to Telegram'
                })
            }
        else:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Failed to send to Telegram',
                    'details': response.text
                })
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }