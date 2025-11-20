How do I use a Vercel API Access Token?
An Access Token is required in order to use the Vercel API. Tokens can be created and managed at the level of your account.

Avatar for ismaelrumzan
Ismael Rumzan
DX Engineer
Guides
/
API & CLI
2 min read
Copy page
Last updated March 16, 2023
Vercel Access Tokens are required to authenticate and use the Vercel API.

Tokens can be created and managed inside your account settings, and can be scoped to only allow access for specific Teams. This article covers how to create a token and use it with your account.

Creating an Access Token
Make sure that you are under Personal Account and not Teams in the dropdown at the top left in the Navigation bar. Navigate to the Account Tokens page, also found under the Settings area of your Personal Account.

Click Create to open the create token modal.
Enter a descriptive name and click Create Token.
Choose the scope of access for the token from the dropdown.
Make a note of the token created as it will not be shown again.
Using the Access Token in Personal Account API Calls
Once your token has been created, you can use it with the Vercel API. For example:

Identify the Vercel API endpoint you would like to call. For example, to list the deployments in your Personal Account, the endpoint is /v6/deployments. The access token token you created would need access to your Personal Account.
Make a request to https://api.vercel.com/v6/deployments using your access token as the Authorization header.
curl"https://api.vercel.com/v6/deployments" -H "Authorization: Bearer TOKEN"
Request to list the deployments of your Personal Account using curl.
const result = await fetch(
    'https://api.vercel.com/v6/deployments',
    {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${process.env.VERCEL_ACCESS_TOKEN}`,
        }
    }
);
Request to list the deployments in your Personal Account.
------
다음의 코드를 참고하여 vercel-usage를 수정해줘