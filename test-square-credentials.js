import square from 'square';

const { SquareClient, SquareEnvironment } = square;

const client = new SquareClient({
  environment: SquareEnvironment.Sandbox,
  token: process.env.SQUARE_ACCESS_TOKEN
});

console.log('Testing Square Sandbox credentials...\n');

// Test 1: List locations to verify access token is valid
async function testAuth() {
  try {
    console.log('1️⃣ Testing Access Token by listing locations...');
    const response = await client.locations.list();
    
    console.log('✅ Access Token is VALID!\n');
    console.log('📍 Your available locations:');
    
    if (response.locations && response.locations.length > 0) {
      response.locations.forEach((location, index) => {
        console.log(`\nLocation ${index + 1}:`);
        console.log(`  Name: ${location.name}`);
        console.log(`  ID: ${location.id}`);
        console.log(`  Status: ${location.status}`);
        console.log(`  Address: ${location.address?.addressLine1 || 'N/A'}`);
      });
      
      console.log('\n\n🔍 Checking current SQUARE_LOCATION_ID...');
      const currentLocationId = process.env.SQUARE_LOCATION_ID;
      console.log(`Current Location ID in secrets: ${currentLocationId}`);
      
      const matchingLocation = response.locations.find(loc => loc.id === currentLocationId);
      if (matchingLocation) {
        console.log('✅ Your Location ID matches! Everything looks good.');
      } else {
        console.log('❌ ERROR: Your Location ID does NOT match any location from your Access Token!');
        console.log('\n💡 SOLUTION: Update your SQUARE_LOCATION_ID to one of the IDs listed above.');
        console.log(`   Recommended: Use "${response.locations[0].id}"`);
      }
    } else {
      console.log('⚠️  No locations found for this access token.');
    }
    
  } catch (error) {
    console.error('❌ Access Token is INVALID!');
    console.error('Error:', error.errors || error.message);
    console.log('\n💡 Please verify you copied the correct Sandbox Access Token from:');
    console.log('   https://developer.squareup.com/apps → Your App → Credentials → Sandbox');
  }
}

testAuth();
