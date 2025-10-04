import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { images } = await req.json();
    
    if (!images || !Array.isArray(images) || images.length === 0) {
      return new Response(
        JSON.stringify({ error: 'At least one image is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build content array with images
    const content = [
      {
        type: "text",
        text: `You are an expert agricultural advisor analyzing crop photos. Analyze these images for crop health.

Return a JSON object with these fields:
- healthScore: number 0-100 (100 is perfect health)
- stressType: "drought" | "nutrient" | "pest_disease" | "other" | "none"
- confidence: number 0-1 (how confident are you)
- keyFindings: array of 2-4 short observations
- urgency: "low" | "medium" | "high"
- advice: 1-2 sentence plain text advice
- suggestedActions: array of objects with {date: "YYYY-MM-DD" (suggest within next 3 days), type: "irrigate"|"fertilize", amount: number, reason: string} OR null if no action needed

Focus on:
- Leaf color and texture (yellowing, browning, wilting = stress)
- Canopy coverage and density
- Signs of pests or disease (spots, holes, discoloration)
- Overall plant vigor

Be practical and specific in your recommendations.`
      },
      ...images.map((img: string) => ({
        type: "image_url",
        image_url: { url: img }
      }))
    ];

    console.log('Sending request to Lovable AI for crop analysis...');
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          {
            role: 'user',
            content: content
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI usage limit reached. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('AI response received:', data);
    
    const aiResponse = data.choices[0].message.content;
    const analysis = JSON.parse(aiResponse);
    
    console.log('Analysis result:', analysis);

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-crop-photo:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
