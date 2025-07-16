import fetch from 'node-fetch';

const BASE_URL = process.env.API_URL || 'http://localhost:5000';

// Test configuration
const testConfig = {
  adminCredentials: {
    username: 'admin',
    password: 'admin123'
  },
  studentCredentials: {
    mobileNumber: '9876543210',
    studentId: 'STU001',
    password: 'password123'
  }
};

// Utility function to make API requests
async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    const data = await response.json();
    
    return {
      status: response.status,
      success: response.ok,
      data
    };
  } catch (error) {
    return {
      status: 0,
      success: false,
      error: error.message
    };
  }
}

// Test functions
async function testHealthCheck() {
  console.log('🏥 Testing health check...');
  const result = await makeRequest('/health');
  
  if (result.success) {
    console.log('✅ Health check passed');
    console.log(`   Status: ${result.data.message}`);
    console.log(`   Environment: ${result.data.environment}`);
  } else {
    console.log('❌ Health check failed');
    console.log(`   Error: ${result.error || result.data.message}`);
  }
  
  return result.success;
}

async function testAPI() {
  console.log('📚 Testing API documentation...');
  const result = await makeRequest('/api');
  
  if (result.success) {
    console.log('✅ API documentation accessible');
    console.log(`   Version: ${result.data.version}`);
    console.log(`   Endpoints: ${Object.keys(result.data.endpoints).length} categories`);
  } else {
    console.log('❌ API documentation failed');
    console.log(`   Error: ${result.error || result.data.message}`);
  }
  
  return result.success;
}

async function testAdminLogin() {
  console.log('👨‍💼 Testing admin login...');
  const result = await makeRequest('/api/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify(testConfig.adminCredentials)
  });
  
  if (result.success) {
    console.log('✅ Admin login successful');
    console.log(`   User: ${result.data.data.user.username}`);
    console.log(`   Role: ${result.data.data.user.role}`);
    console.log(`   Token: ${result.data.data.token ? 'Present' : 'Missing'}`);
    return result.data.data.token;
  } else {
    console.log('❌ Admin login failed');
    console.log(`   Error: ${result.data.message}`);
    return null;
  }
}

async function testStudentLogin() {
  console.log('👨‍🎓 Testing student login...');
  const result = await makeRequest('/api/auth/student/login', {
    method: 'POST',
    body: JSON.stringify(testConfig.studentCredentials)
  });
  
  if (result.success) {
    console.log('✅ Student login successful');
    console.log(`   Student ID: ${result.data.data.user.studentId}`);
    console.log(`   Mobile: ${result.data.data.user.mobileNumber}`);
    console.log(`   Token: ${result.data.data.token ? 'Present' : 'Missing'}`);
    return result.data.data.token;
  } else {
    console.log('❌ Student login failed');
    console.log(`   Error: ${result.data.message}`);
    return null;
  }
}

async function testQuestionsAPI() {
  console.log('❓ Testing questions API...');
  const result = await makeRequest('/api/quiz/questions/1');
  
  if (result.success) {
    console.log('✅ Questions API working');
    console.log(`   Level: ${result.data.data.level}`);
    console.log(`   Questions: ${result.data.data.questions.length}`);
    console.log(`   Total: ${result.data.data.totalQuestions}`);
  } else {
    console.log('❌ Questions API failed');
    console.log(`   Error: ${result.data.message}`);
  }
  
  return result.success;
}

async function testProtectedEndpoints(adminToken, studentToken) {
  console.log('🔒 Testing protected endpoints...');
  
  // Test admin dashboard
  if (adminToken) {
    const adminResult = await makeRequest('/api/admin/dashboard/overview', {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    if (adminResult.success) {
      console.log('✅ Admin dashboard accessible');
      console.log(`   Students: ${adminResult.data.data.overview.totalStudents}`);
      console.log(`   Sessions: ${adminResult.data.data.overview.totalSessions}`);
    } else {
      console.log('❌ Admin dashboard failed');
      console.log(`   Error: ${adminResult.data.message}`);
    }
  }
  
  // Test student profile
  if (studentToken) {
    const profileResult = await makeRequest('/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${studentToken}`
      }
    });
    
    if (profileResult.success) {
      console.log('✅ Student profile accessible');
      console.log(`   Username: ${profileResult.data.data.user.username}`);
      console.log(`   Role: ${profileResult.data.data.user.role}`);
    } else {
      console.log('❌ Student profile failed');
      console.log(`   Error: ${profileResult.data.message}`);
    }
  }
}

async function runAllTests() {
  console.log('🚀 Starting API tests...\n');
  
  // Test basic endpoints
  const healthOk = await testHealthCheck();
  console.log('');
  
  const apiOk = await testAPI();
  console.log('');
  
  const questionsOk = await testQuestionsAPI();
  console.log('');
  
  // Test authentication
  const adminToken = await testAdminLogin();
  console.log('');
  
  const studentToken = await testStudentLogin();
  console.log('');
  
  // Test protected endpoints
  await testProtectedEndpoints(adminToken, studentToken);
  console.log('');
  
  // Summary
  console.log('📊 Test Summary:');
  console.log(`   Health Check: ${healthOk ? '✅' : '❌'}`);
  console.log(`   API Docs: ${apiOk ? '✅' : '❌'}`);
  console.log(`   Questions API: ${questionsOk ? '✅' : '❌'}`);
  console.log(`   Admin Login: ${adminToken ? '✅' : '❌'}`);
  console.log(`   Student Login: ${studentToken ? '✅' : '❌'}`);
  
  const allPassed = healthOk && apiOk && questionsOk && adminToken && studentToken;
  console.log(`\n${allPassed ? '🎉 All tests passed!' : '⚠️  Some tests failed. Check the logs above.'}`);
  
  return allPassed;
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    });
}

export { runAllTests, makeRequest }; 