// Background service worker for Website Blocker

// Define types for better TypeScript support
interface BlockingRule {
  id: number;
  priority: number;
  action: {
    type: 'redirect';
    redirect: {
      extensionPath: string;
    };
  };
  condition: {
    urlFilter: string;
    resourceTypes: string[];
  };
}

// Track if we're currently updating rules to prevent conflicts
let isUpdatingRules = false;

chrome.runtime.onInstalled.addListener(() => {
  console.log('Website Blocker installed');
  // Initialize default settings
  chrome.storage.sync.set({
    isBlocking: true,
    websites: ['instagram.com', 'twitter.com', 'facebook.com', 'youtube.com'],
    schedule: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      startTime: '09:00',
      endTime: '17:00'
    }
  });
});

// Listen for storage changes and update blocking rules
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    updateBlockingRules();
  }
});

// Update blocking rules based on current settings
async function updateBlockingRules() {
  // Prevent multiple simultaneous updates
  if (isUpdatingRules) {
    console.log('Already updating rules, skipping...');
    return;
  }
  
  isUpdatingRules = true;
  
  try {
    const data = await chrome.storage.sync.get(['isBlocking', 'websites', 'schedule']);
    const { isBlocking, websites, schedule } = data;
    
    // Always clear ALL existing dynamic rules first
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    console.log('Clearing', existingRules.length, 'existing rules');
    
    if (existingRules.length > 0) {
      const ruleIdsToRemove = existingRules.map(rule => rule.id);
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: ruleIdsToRemove
      });
      console.log('Cleared all existing rules');
    }
    
    // If blocking is disabled or outside schedule, don't add any rules
    if (!isBlocking || !shouldBlockNow(schedule)) {
      console.log('Blocking disabled or outside schedule - no rules added');
      return;
    }
    
    // Create multiple blocking rules for each website to catch variations
    const rules: BlockingRule[] = [];
    let ruleId = 1; // Start fresh with ID 1
    
    websites.forEach((website: string) => {
      // Pattern 1: Block with subdomain wildcard (*.example.com)
      rules.push({
        id: ruleId++,
        priority: 1,
        action: {
          type: 'redirect',
          redirect: {
            extensionPath: `/blocked.html?url=${encodeURIComponent(website)}`
          }
        },
        condition: {
          urlFilter: `*://*.${website}/*`,
          resourceTypes: ['main_frame']
        }
      });
      
      // Pattern 2: Block without subdomain wildcard (example.com)
      rules.push({
        id: ruleId++,
        priority: 1,
        action: {
          type: 'redirect',
          redirect: {
            extensionPath: `/blocked.html?url=${encodeURIComponent(website)}`
          }
        },
        condition: {
          urlFilter: `*://${website}/*`,
          resourceTypes: ['main_frame']
        }
      });
      
      // Pattern 3: Block exact domain
      rules.push({
        id: ruleId++,
        priority: 1,
        action: {
          type: 'redirect',
          redirect: {
            extensionPath: `/blocked.html?url=${encodeURIComponent(website)}`
          }
        },
        condition: {
          urlFilter: `*://${website}`,
          resourceTypes: ['main_frame']
        }
      });
      
      // Pattern 4: Block with www
      rules.push({
        id: ruleId++,
        priority: 1,
        action: {
          type: 'redirect',
          redirect: {
            extensionPath: `/blocked.html?url=${encodeURIComponent(website)}`
          }
        },
        condition: {
          urlFilter: `*://www.${website}/*`,
          resourceTypes: ['main_frame']
        }
      });
    });
    
    if (rules.length > 0) {
      console.log('Adding', rules.length, 'new rules');
      await chrome.declarativeNetRequest.updateDynamicRules({
        addRules: rules as any[]
      });
      console.log('Successfully added', rules.length, 'blocking rules for', websites.length, 'websites');
    }
    
  } catch (error) {
    console.error('Error updating blocking rules:', error);
    
    // If we get a duplicate ID error, try clearing everything and starting over
    if (error instanceof Error && error.message.includes('unique ID')) {
      console.log('Duplicate ID error - clearing all rules and retrying...');
      try {
        // Force clear all rules
        const allRules = await chrome.declarativeNetRequest.getDynamicRules();
        if (allRules.length > 0) {
          await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: allRules.map(rule => rule.id)
          });
        }
        console.log('Force cleared all rules due to ID conflict');
      } catch (clearError) {
        console.error('Error force clearing rules:', clearError);
      }
    }
  } finally {
    isUpdatingRules = false;
  }
}

// Check if we should block websites based on current time and schedule
function shouldBlockNow(schedule: any): boolean {
  if (!schedule) return false;
  
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
  const currentTime = now.getHours() * 60 + now.getMinutes(); // minutes since midnight
  
  // Check if today is in the scheduled days
  if (!schedule.days.includes(currentDay)) {
    return false;
  }
  
  // Parse start and end times
  const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
  const [endHour, endMinute] = schedule.endTime.split(':').map(Number);
  
  const startTime = startHour * 60 + startMinute;
  const endTime = endHour * 60 + endMinute;
  
  // Check if current time is within the blocking window
  return currentTime >= startTime && currentTime <= endTime;
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateBlocking') {
    updateBlockingRules().then(() => {
      sendResponse({ success: true });
    }).catch((error) => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // Will respond asynchronously
  } else if (request.action === 'getStatus') {
    chrome.storage.sync.get(['isBlocking', 'websites', 'schedule']).then((data) => {
      sendResponse({
        ...data,
        shouldBlock: shouldBlockNow(data.schedule)
      });
    });
    return true; // Will respond asynchronously
  }
});

// Update rules when the extension starts
updateBlockingRules();