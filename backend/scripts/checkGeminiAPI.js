require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const axios = require('axios');

const checkAPI = async () => {
  try {
    if (!process.env.GOOGLE_API_KEY) {
      console.error('❌ GOOGLE_API_KEY is not set');
      process.exit(1);
    }
    
    console.log('🔍 Checking Gemini API access...\n');
    
    // Try to list models using REST API
    const response = await axios.get(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_API_KEY}`
    );
    
    console.log('✅ API connection successful!\n');
    console.log('📋 Available models:');
    
    const models = response.data.models || [];
    const generateModels = models.filter(m => 
      m.supportedGenerationMethods && 
      m.supportedGenerationMethods.includes('generateContent')
    );
    
    if (generateModels.length > 0) {
      generateModels.forEach(model => {
        console.log(`   ✅ ${model.name}`);
        if (model.displayName) {
          console.log(`      Display: ${model.displayName}`);
        }
      });
      
      // Try the first available model
      if (generateModels.length > 0) {
        const testModel = generateModels[0].name.replace('models/', '');
        console.log(`\n🧪 Testing with model: ${testModel}`);
        
        const testResponse = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/${generateModels[0].name}:generateContent?key=${process.env.GOOGLE_API_KEY}`,
          {
            contents: [{
              parts: [{ text: 'Say hello' }]
            }]
          }
        );
        
        console.log('✅ Model test successful!');
        console.log(`   Response: ${testResponse.data.candidates[0].content.parts[0].text.substring(0, 50)}...`);
      }
    } else {
      console.log('⚠️  No models found with generateContent support');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.status === 403) {
      console.error('\n💡 This might be an API key permission issue.');
      console.error('   Make sure your API key has access to Gemini API.');
    }
    process.exit(1);
  }
};

checkAPI();

