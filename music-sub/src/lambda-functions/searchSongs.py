import json
import boto3
from boto3.dynamodb.conditions import Key, Attr

dynamodb = boto3.resource('dynamodb')
music_table = dynamodb.Table('music')

def lambda_handler(event, context):
    # CORS headers
    headers = {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*'
    }

    if event.get('httpMethod', '').lower() == 'options':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'message': 'Options request successful'})
        }

    try:
        params = event.get('queryStringParameters') or {}
        artist = (params.get('artist') or '').strip()
        title = (params.get('title') or '').strip()
        album = (params.get('album') or '').strip().lower()
        year = (params.get('year') or '').strip()

        print(f"Received params -> artist: '{artist}', title: '{title}', album: '{album}', year: '{year}'")

        # First query attempt: try to query by artist if provided
        if artist:
            response = music_table.query(
                KeyConditionExpression=Key('artist').eq(artist)
            )
            items = response.get('Items', [])

            # If no results were found in the query, fall back to scanning the table for partial matches
            if not items:
                print("Artist not found with exact match, falling back to scan for partial matches.")
                response = music_table.scan(
                    FilterExpression=Attr('artist').contains(artist)  # Partial match for artist
                )
                items = response.get('Items', [])
        else:
            # If no artist is provided, fall back to scanning the table
            response = music_table.scan()
            items = response.get('Items', [])

        # Further filtering on non-key attributes like title, album, and year
        def matches(song):
            album_title = song.get('album_title', '')
            parts = album_title.split('#') if '#' in album_title else ['', '']
            song_album, song_title = parts if len(parts) == 2 else ('', '')

            return (
                (not title or title.lower() in song.get('title', '').lower()) and
                (not album or album in song_album.lower()) and
                (not year or year in str(song.get('year', '')).lower())
            )

        filtered_items = [song for song in items if matches(song)]

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'items': filtered_items})
        }

    except Exception as e:
        print("Error:", str(e))
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }
