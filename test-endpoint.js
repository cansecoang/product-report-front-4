// Test script to verify the product-tasks endpoint

async function testEndpoint() {
  try {
    const response = await fetch('http://localhost:3003/api/product-tasks?productId=1');
    const data = await response.json();
    
    console.log('Endpoint response:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.tasks && data.tasks.length > 0) {
      console.log('\nFirst task details:');
      const firstTask = data.tasks[0];
      console.log('org_id:', firstTask.org_id);
      console.log('org_name:', firstTask.org_name);
      console.log('responsible_id:', firstTask.responsible_id);
      console.log('responsible_name:', firstTask.responsible_name);
    }
  } catch (error) {
    console.error('Error testing endpoint:', error);
  }
}

testEndpoint();
