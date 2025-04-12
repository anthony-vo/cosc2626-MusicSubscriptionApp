import json
import boto3

dynamodb = boto3.resource('dynamodb')
music_table = dynamodb.Table('music')

def lambda_handler(event, context):
    # CORS headers
    headers = {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*'
    }

    # Handle preflight
    if event.get('httpMethod', '').lower() == 'options':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'message': 'Options request successful'})
        }

    try:
        # Get query params (safe defaults)
        params = event.get('queryStringParameters') or {}
        artist = (params.get('artist') or '').lower()
        title = (params.get('title') or '').lower()
        album = (params.get('album') or '').lower()
        year = (params.get('year') or '').lower()

        # Scan music table
        scan_response = music_table.scan()
        items = scan_response.get('Items', [])

        def matches(song):
            return (
                (not artist or artist in song.get('artist', '').lower()) and
                (not title or title in song.get('title', '').lower()) and
                (not album or album in song.get('album', '').lower()) and
                (not year or year in str(song.get('year', '')).lower())
            )

        filtered_items = [song for song in items if matches(song)]

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'items': filtered_items})
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }
