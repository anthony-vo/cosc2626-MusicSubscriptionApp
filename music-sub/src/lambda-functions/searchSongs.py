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

        # More efficient querying with new schema
        if artist:
            # Query by partition key if artist specified
            query_params = {
                'KeyConditionExpression': 'artist = :artist',
                'ExpressionAttributeValues': {':artist': artist}
            }
            response = music_table.query(**query_params)
        else:
            # Fall back to scan if no artist specified
            response = music_table.scan()
        
        items = response.get('Items', [])

        def matches(song):
            # Extract album and title from composite key if needed
            album_title = song.get('album_title', '')
            song_album, song_title = album_title.split('#') if '#' in album_title else ('', '')
            
            return (
                (not artist or artist in song.get('artist', '').lower()) and
                (not title or (title in song_title.lower() if song_title else False)) and
                (not album or (album in song_album.lower() if song_album else False)) and
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