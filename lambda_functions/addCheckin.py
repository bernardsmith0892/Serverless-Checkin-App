import json
import time
import datetime
import base64
import boto3

def lambda_handler(event, context):
    # Get the service resource.
    dynamodb = boto3.resource('dynamodb');
    table = dynamodb.Table('NSEC-Checkins');
    ts = datetime.datetime.utcnow();
    
    try:
        # Decodes the provided Cognito ID token to grab the user's name. Assumes that API Gateway has already validated this token with Cognito.
        payload = event['headers']['Authorization'].split('.')[1]; # Extract the payload from the JWT
        payload = payload + '=' * (len(payload) % 4) # Adds any additional padding, if needed
        params = json.loads(base64.b64decode(payload)); # Decode the payload
        
        ret_val = {
        'statusCode': 200,
        "headers": {
            "X-Requested-With": '*',
            "Access-Control-Allow-Headers": 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,x-requested-with',
            "Access-Control-Allow-Origin": '*',
            "Access-Control-Allow-Methods": 'POST,GET,OPTIONS'
        },
        'body': json.dumps("Checked in " + params['name'] + " at " + str(ts))
        };
    except:
        params = event['request']['userAttributes']
        ret_val = event;


    table.put_item(Item={
        'name': params['name'],
        'timestamp': str(ts),
    })
    
    return ret_val;
