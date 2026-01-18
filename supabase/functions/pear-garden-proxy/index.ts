import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PEAR_API_BASE_URL = 'https://hl-v2.pearprotocol.io';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, params } = body;

    console.log(`Pear Proxy - Action: ${action}`, params);

    let targetUrl: string;
    let method = 'GET';
    let requestBody: string | undefined;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': '*/*',
    };

    switch (action) {
      case 'getEip712Message': {
        const { address, clientId } = params;
        targetUrl = `${PEAR_API_BASE_URL}/auth/eip712-message?address=${encodeURIComponent(address)}&clientId=${encodeURIComponent(clientId)}`;
        break;
      }

      case 'login': {
        targetUrl = `${PEAR_API_BASE_URL}/auth/login`;
        method = 'POST';
        requestBody = JSON.stringify(params);
        break;
      }

      case 'createAgentWallet': {
        const { accessToken } = params;
        targetUrl = `${PEAR_API_BASE_URL}/agentWallet`;
        method = 'POST';
        headers['Authorization'] = `Bearer ${accessToken}`;
        requestBody = JSON.stringify({});
        break;
      }

      case 'getAgentWallet': {
        const { accessToken } = params;
        targetUrl = `${PEAR_API_BASE_URL}/agentWallet`;
        headers['Authorization'] = `Bearer ${accessToken}`;
        break;
      }

      case 'getApiKeys': {
        const { accessToken } = params;
        targetUrl = `${PEAR_API_BASE_URL}/api-keys`;
        headers['Authorization'] = `Bearer ${accessToken}`;
        break;
      }

      case 'createApiKey': {
        const { accessToken, name } = params;
        targetUrl = `${PEAR_API_BASE_URL}/api-keys`;
        method = 'POST';
        headers['Authorization'] = `Bearer ${accessToken}`;
        requestBody = JSON.stringify({ name: name || 'Voxtrade Key' });
        break;
      }

      case 'getMarkets': {
        targetUrl = `${PEAR_API_BASE_URL}/markets`;
        break;
      }

      case 'getPositions': {
        const { accessToken, address } = params;
        targetUrl = `${PEAR_API_BASE_URL}/positions?address=${encodeURIComponent(address)}`;
        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`;
        }
        break;
      }

      case 'placeOrder': {
        const { accessToken, ...orderParams } = params;
        targetUrl = `${PEAR_API_BASE_URL}/orders`;
        method = 'POST';
        headers['Authorization'] = `Bearer ${accessToken}`;
        requestBody = JSON.stringify(orderParams);
        break;
      }

      case 'placeSpotOrder': {
        const { accessToken, asset, isBuy, amount } = params;
        targetUrl = `${PEAR_API_BASE_URL}/orders/spot`;
        method = 'POST';
        headers['Authorization'] = `Bearer ${accessToken}`;
        requestBody = JSON.stringify({ asset, isBuy, amount });
        break;
      }

      case 'getOpenOrders': {
        const { accessToken } = params;
        targetUrl = `${PEAR_API_BASE_URL}/orders/open`;
        headers['Authorization'] = `Bearer ${accessToken}`;
        break;
      }

      case 'cancelOrder': {
        const { accessToken, orderId } = params;
        targetUrl = `${PEAR_API_BASE_URL}/orders/${orderId}/cancel`;
        method = 'DELETE';
        headers['Authorization'] = `Bearer ${accessToken}`;
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action', action }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    console.log(`Proxying ${method} to: ${targetUrl}`);
    if (requestBody) {
      console.log('Request body:', requestBody);
    }

    const response = await fetch(targetUrl, {
      method,
      headers,
      body: requestBody,
    });

    const responseText = await response.text();
    console.log(`Response status: ${response.status}`);
    console.log(`Response body: ${responseText.substring(0, 1000)}`);

    // Try to parse as JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw: responseText };
    }

    return new Response(
      JSON.stringify({ data: responseData, status: response.status }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Proxy error:', errorMessage);
    return new Response(
      JSON.stringify({ error: 'Proxy error', message: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
