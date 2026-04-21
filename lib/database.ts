import apiClient from "./config";

export const getUserByEmail = async (email_id: string, org_id: string) => {
    try { 
        const response = await apiClient.get('/get-user', {
            params: { email_id, org_id }
        });
        const user = response.data.data;
        if(!user) {
            throw new Error("User not found");
        }
        else {
            return user;
        }
    }
    catch (error) {
        console.error("Error fetching user by email:", error);
        return null;
    }
}

export const getUserByEmailWithPermissions = async (email_id: string, org_id: string) => {
    try { 
        const response = await apiClient.get('/get-user-with-permissions', {
            params: { email_id, org_id }
        });
        const user = response.data.data;
        // console.log("********************User fetched form the API:", user)
        if(!user) {
            throw new Error("User not found");
        }
        else {
            return user;
        }
    }
    catch (error) {
        console.error("Error fetching user by email:", error);
        return null;
    }
}

export const getUserFromCommon = async (email_id: string) => {
    try { 
        const response = await apiClient.get('/v2/get-user-and-parent-org', {
            params: { email_id }
        });
        const user = response.data.data.user;
        const parent = response.data.data.parent_org;
        console.log(response.data)
        if(!user) {
            throw new Error("User not found");
        }
        else {
            return {user, parent};
        }
    }
    catch (error) {
        console.error("Error fetching user by email:", error);
        return { user: null, parent: null };
    }
}



//Here we need a function to set a reset token and the expiry date in the database
export const updateUserResetToken = async (email: string, token: string, expiry: Date, org_id: string) => {  
    try {
        const response = await apiClient.post('/update-user-reset-token', {
            email,
            token,
            expiry,
            org_id
        });
        if (response.status !== 200) {
            console.error("Could not update reset token")
            return null
        }
        return response.data.status;
        
    } catch (error) {
        console.error("Error updating user reset token:", error);
        return null;
    }
}

//I now need an function get get user by reset token
export const getUserByResetToken = async (token: string, parent_org_id: string) => {
    try {
        const response = await apiClient.get(`/get-user-by-reset-token`, {
            params: { token, parent_org_id }
        });
        const user = response.data.data;
        if(!user) {
            throw new Error("User not found");
        }
        else {
            return user;
        }
    } catch (error) {
        console.error("Error fetching user by reset token:", error);
        return null;
    }
}


//This function will update the password in the database
export const resetUserPassword = async (email: string, password: string, parent_org_id:string) => {
    try {
        const response = await apiClient.post('/update-user-password', {
            email,
            password,
            parent_org_id
        });
        if (response.status !== 200) {
            console.error("Could not update password")
        }
    } catch (error) {
        console.error("Error updating user password:", error);
        return null;
    }
}


export const getAllAssets = async (token:string) => {
    try {
        const response = await apiClient.get('/get-all-assets', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.data;
    } catch (error) {
        console.error("Error fetching asset data:", error);
        return null;
    }
}

export const getAssetCoreMetrics = async (assetId: string, token: string) => {
    try {
        const response = await apiClient.get(`/get-core-asset-metrics/${assetId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching asset core metrics:", error);
        return null;
    }
}




export const postFetcher = async ([url, token, body]: [string, string, any]) => {
  let res = await apiClient.post<any>(url, body, { headers: { Authorization: `Bearer ${token}` } });
  return res;
};

// Fetch notifications for a user - following the same pattern as other API calls
export const getNotifications = async (userId: string, token: string) => {
  try {
    const response = await apiClient.get(`/get-pending-notifications-by-user-id/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};

// Alternative fetcher for notifications that follows the same pattern as other SWR fetchers
export const notificationFetcher = ([url, token]: [string, string]) => 
  apiClient
  .get<any>(url, {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(res => res.data.data || [])

// Fetch network performance data
export const getNetworkPerformance = async (token: string) => {
  try {
    const response = await apiClient.get('/get-all-assets-last-week-summary', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Process the data - API already returns processed KPIs
    const data = response.data.data || {};
    
    // Map the API response to our component format
    return {
      impressions: data.total_impressions_delta || 0,
      uniqueReach: data.total_reach_delta || 0,
      frequency: data.frequency || 0
    };
  } catch (error) {
    console.error("Error fetching network performance:", error);
    throw error;
  }
};

export const fetchCampaignData = async (campaignCode: string, token:string) => {
  try {
        console.log("Fetching new data for campaign", campaignCode)
        const response = await apiClient.get(`/get-campaign-chat-context/${campaignCode}`, {
          headers: {Authorization: `Bearer ${token}`}
        });
        const campaign = response.data.data;
        if (!campaign) {
        throw new Error("Campaign not found");
        } else {
        return campaign;
        }     
    }
    catch (error) {
        console.error("Error fetching campaign data:", error);
        return null;
    }
}      