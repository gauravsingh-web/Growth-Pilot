'use strict';

/**
 * GeminiProvider — wraps Google Generative AI for production use.
 */

class GeminiProvider {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.available = false;
    this.model = null;
    this._init();
  }

  async _init() {
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      this.available = true;
    } catch (err) {
      console.warn('[GeminiProvider] Gemini SDK not available or key invalid:', err.message);
      this.available = false;
    }
  }

  async generateResponse(message, merchantContext) {
    if (!this.available || !this.model) {
      throw new Error('Gemini not available');
    }

    const systemPrompt = `You are GrowthPilot, an AI business partner for ${merchantContext.merchant.businessName}, 
a ${merchantContext.merchant.category} in ${merchantContext.merchant.location}.

MERCHANT CONTEXT:
- Today's Revenue: ₹${merchantContext.salesMetrics.todayRevenue} (${merchantContext.salesMetrics.revenueChange}% change)
- Today's Transactions: ${merchantContext.salesMetrics.todayTransactions}
- Average Order Value: ₹${merchantContext.salesMetrics.averageOrderValue}
- Total Customers: ${merchantContext.customerSegments.total}
- At-Risk Customers: ${merchantContext.customerSegments.atRisk}
- Business Health Score: ${merchantContext.healthScore}/100

TOP PRODUCTS:
${merchantContext.productPerformance.topProducts.slice(0, 5).map(p => 
  `- ${p.name}: ${p.totalOrders} orders, ₹${p.totalRevenue} revenue (${p.trend > 0 ? '+' : ''}${p.trend}%)`
).join('\n')}

ACTIVE CAMPAIGNS: ${merchantContext.campaigns.filter(c => c.status === 'active').length}

OPPORTUNITIES DETECTED:
${merchantContext.opportunities.slice(0, 3).map(o => 
  `- ${o.title}: ${o.expectedImpact} (${o.confidence}% confidence)`
).join('\n')}

IMPORTANT GUIDELINES:
1. Always respond in a helpful, data-driven way
2. Reference actual business data in your responses
3. When recommending actions, be specific about expected impact
4. Always label estimates as "estimated" or "projected"
5. Be concise but thorough
6. Use Indian Rupee (₹) for currency
7. Respond in a professional but friendly tone
8. After analysis, always suggest a specific action

Respond to the merchant's message. Use markdown formatting. Include specific numbers from the context.`;

    try {
      const chat = this.model.startChat({
        history: [],
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        },
      });

      const result = await chat.sendMessage(`${systemPrompt}\n\nMerchant asks: ${message}`);
      const response = await result.response;
      return {
        text: response.text(),
        actions: [],
      };
    } catch (err) {
      throw new Error(`Gemini API error: ${err.message}`);
    }
  }
}

module.exports = GeminiProvider;
