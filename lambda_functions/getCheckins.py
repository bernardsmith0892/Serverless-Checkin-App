import json
import time
import datetime
import boto3
from boto3.dynamodb.conditions import Key

def latestCheckin(response):
    maxTime = datetime.datetime.min;
    for i in response['Items']:
        if(datetime.datetime.strptime(i['timestamp'], '%Y-%m-%d %H:%M:%S.%f') > maxTime):
            maxTime = datetime.datetime.strptime(i['timestamp'], '%Y-%m-%d %H:%M:%S.%f');
    return datetime.datetime.strftime(maxTime, '%Y-%m-%d %H:%M:%S.%f');

def lambda_handler(event, context):
    # Get the service resource.
    dynamodb = boto3.resource('dynamodb');
    checkins_table = dynamodb.Table('NSEC-Checkins');
    users_table = dynamodb.Table('NSEC-Users');
    try:
        group = "test" #event['queryStringParameters']['group'];
    except:
        return {
            'statusCode': 400,
            "headers": {
                "X-Requested-With": '*',
                "Access-Control-Allow-Headers": 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,x-requested-with',
                "Access-Control-Allow-Origin": '*',
                "Access-Control-Allow-Methods": 'POST,GET,OPTIONS'
            },
            'body': json.dumps("Must provide a 'group' parameter.")
        }
        
    users_response = users_table.query(
        KeyConditionExpression=Key('group').eq(group)
    )
    
    checkins = []
    for i in users_response['Items']:
        checkin_response = checkins_table.query(
            KeyConditionExpression=Key('name').eq(i['name'])
        )
        
        checkins.append( {
            "name": i['name'],
            "timestamp": latestCheckin(checkin_response)
        } )
    
    return {
        'statusCode': 200,
        "headers": {
            "X-Requested-With": '*',
            "Access-Control-Allow-Headers": 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,x-requested-with',
            "Access-Control-Allow-Origin": '*',
            "Access-Control-Allow-Methods": 'POST,GET,OPTIONS'
        },
        'body': json.dumps(checkins)
    }
