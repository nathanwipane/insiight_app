export const trackEvent = (eventName: string, data = {}) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, data)
  }
}

export const trackCustomEvent = (eventName: string, data = {}) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackCustom', eventName, data)
  }
}

export const trackEventWithUserData = async (eventName: string, userData: Record<string, any> = {}) => {
    if (typeof window === 'undefined' || !window.fbq) return
    
    // Hash PII fields
    const hashedUserData: Record<string, any> = {}
    
    if (userData.email) {
      hashedUserData.email = await hashEmail(userData.email)
    }
    
    if (userData.phone) {
      hashedUserData.phone = await hashPhone(userData.phone)
    }
    
    if (userData.firstName) {
      hashedUserData.firstName = await hashName(userData.firstName)
    }
    
    if (userData.lastName) {
      hashedUserData.lastName = await hashName(userData.lastName)
    }
    
    if (userData.city) {
      hashedUserData.city = await hashGeneric(userData.city)
    }
    
    if (userData.state) {
      hashedUserData.state = await hashGeneric(userData.state)
    }
    
    if (userData.zip) {
      hashedUserData.zip = await hashGeneric(userData.zip)
    }
    
    if (userData.country) {
      hashedUserData.country = await hashGeneric(userData.country)
    }
    
    if (userData.gender) {
      hashedUserData.gender = await hashGeneric(userData.gender)
    }
    
    if (userData.dateOfBirth) {
      hashedUserData.dateOfBirth = await hashGeneric(userData.dateOfBirth)
    }
      
    window.fbq('track', eventName, hashedUserData)



}


// Normalize and hash email
export const hashEmail = async (email: string) => {
  if (!email) return null
  
  // 1. Convert to lowercase
  // 2. Trim whitespace
  const normalized = email.toLowerCase().trim()
  
  // 3. Hash with SHA-256
  const encoder = new TextEncoder()
  const data = encoder.encode(normalized)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  
  // 4. Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  return hashHex
}

// Normalize and hash phone
export const hashPhone = async (phone: string) => {
  if (!phone) return null
  
  // 1. Remove all non-numeric characters
  const digitsOnly = phone.replace(/\D/g, '')
  
  // 2. Hash with SHA-256
  const encoder = new TextEncoder()
  const data = encoder.encode(digitsOnly)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  
  // 3. Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  return hashHex
}

// Normalize and hash names
export const hashName = async (name: string) => {
  if (!name) return null
  
  // 1. Convert to lowercase
  // 2. Trim whitespace
  // 3. Remove all non-alphanumeric characters except spaces
  const normalized = name.toLowerCase().trim().replace(/[^a-z\s]/g, '')
  
  // 4. Hash with SHA-256
  const encoder = new TextEncoder()
  const data = encoder.encode(normalized)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  
  // 5. Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  return hashHex
}

// Hash city, state, zip, country
export const hashGeneric = async (value: string) => {
  if (!value) return null
  
  const normalized = value.toLowerCase().trim().replace(/[^a-z0-9]/g, '')
  
  const encoder = new TextEncoder()
  const data = encoder.encode(normalized)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  return hashHex
}