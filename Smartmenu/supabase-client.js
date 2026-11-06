/**
 * SmartMenu Supabase Client Integration
 * Handles Auth, Restaurant Profile, Dishes (with AR Models), Standees, and Orders.
 */

(function (window) {
  'use strict';

  // Default configuration keys
  const DEFAULT_SUPABASE_URL = 'https://jmqljyniphlzmpwytujs.supabase.co';
  const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptcWxqeW5pcGhsem1wd3l0dWpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxNzg3NDQsImV4cCI6MjEwODc1NDc0NH0.BEICvrknvgrtnK_McOkFO0w8_xQah2lhETatHwWv2QE';
  const STORAGE_KEY_URL = 'smartmenu_supabase_url';
  const STORAGE_KEY_KEY = 'smartmenu_supabase_anon_key';
  const STORAGE_KEY_REST_ID = 'smartmenu_current_restaurant_id';

  let supabaseClient = null;

  const SupabaseService = {
    // Current connection status
    isConnected: false,

    // Get stored config
    getConfig: function () {
      return {
        url: localStorage.getItem(STORAGE_KEY_URL) || DEFAULT_SUPABASE_URL,
        anonKey: localStorage.getItem(STORAGE_KEY_KEY) || DEFAULT_SUPABASE_ANON_KEY,
        restaurantId: localStorage.getItem(STORAGE_KEY_REST_ID) || '11111111-1111-1111-1111-111111111111'
      };
    },

    // Lazy load or return initialized client
    getClient: function () {
      if (supabaseClient) return supabaseClient;
      const config = this.getConfig();
      if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        try {
          supabaseClient = window.supabase.createClient(config.url, config.anonKey);
          this.isConnected = true;
          return supabaseClient;
        } catch (err) {
          console.error('[SmartMenu DB] Client init error:', err);
          return null;
        }
      }
      return null;
    },

    // Save and re-initialize client
    saveConfig: async function (url, anonKey) {
      if (!url || !anonKey) {
        throw new Error('Please provide both Supabase URL and Anon Key.');
      }
      localStorage.setItem(STORAGE_KEY_URL, url.trim().replace(/\/$/, ''));
      localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
      supabaseClient = null;
      return await this.init();
    },

    // Initialize the Supabase JS client
    init: async function () {
      let client = this.getClient();
      if (!client) {
        // Wait briefly for CDN script
        for (let i = 0; i < 5; i++) {
          await new Promise(r => setTimeout(r, 150));
          client = this.getClient();
          if (client) break;
        }
      }

      if (!client) {
        console.warn('[SmartMenu DB] Supabase library not loaded yet.');
        return false;
      }

      try {
        const { error } = await client.from('restaurants').select('id').limit(1);
        if (error) {
          console.warn('[SmartMenu DB] Supabase connected with notice:', error.message);
          this.isConnected = false;
          return false;
        }
        this.isConnected = true;
        console.log('[SmartMenu DB] Successfully connected to live Supabase database!');
        return true;
      } catch (err) {
        console.error('[SmartMenu DB] Ping error:', err);
        this.isConnected = false;
        return false;
      }
    },

    // Test connection directly
    testConnection: async function (url, anonKey) {
      if (typeof window.supabase === 'undefined') {
        throw new Error('Supabase SDK is loading. Please try again in a few seconds.');
      }
      const testClient = window.supabase.createClient(url.trim().replace(/\/$/, ''), anonKey.trim());
      const { data, error } = await testClient.from('restaurants').select('id, name').limit(1);
      if (error) throw error;
      return data;
    },

    // Get current authenticated user
    getCurrentUser: async function () {
      const client = this.getClient();
      if (client) {
        try {
          const { data: { user } } = await client.auth.getUser();
          if (user) {
            localStorage.setItem('smartmenu_auth_user', JSON.stringify({ id: user.id, email: user.email }));
            return user;
          }
        } catch (err) {
          console.warn('[SmartMenu DB] getUser warning:', err);
        }
      }
      return JSON.parse(localStorage.getItem('smartmenu_auth_user')) || null;
    },

    // Step 1: Owner Sign Up via Supabase Auth
    signUpOwner: async function (email, password, fullName, phone) {
      const client = this.getClient();
      if (!client) throw new Error('Database connection not ready.');

      const cleanEmail = email.trim().toLowerCase();
      const { data, error } = await client.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            full_name: fullName,
            phone: phone
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        localStorage.setItem('smartmenu_auth_user', JSON.stringify({ id: data.user.id, email: data.user.email, name: fullName }));
      }

      return data;
    },

    // Complete Onboarding & Full Restaurant Registration to Database
    registerRestaurantAndOwner: async function (regData) {
      const client = this.getClient();
      if (!client) throw new Error('Supabase client could not be loaded. Please check your internet connection.');

      const email = regData.ownerEmail.trim().toLowerCase();
      const password = regData.password;
      const ownerName = regData.ownerName ? regData.ownerName.trim() : 'Owner';
      const ownerPhone = regData.ownerPhone ? regData.ownerPhone.trim() : '';

      console.log('[SmartMenu DB] Registering owner and restaurant in Supabase:', email, regData.name);

      // 1. Sign up owner (or sign in if already exists)
      let user = null;
      const { data: signUpData, error: signUpErr } = await client.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: ownerName,
            phone: ownerPhone
          }
        }
      });

      if (signUpErr) {
        if (signUpErr.message.toLowerCase().includes('already registered')) {
          const { data: signInData, error: signInErr } = await client.auth.signInWithPassword({
            email: email,
            password: password
          });
          if (signInErr) throw new Error('An account already exists with this email, but the password entered was incorrect.');
          user = signInData.user;
        } else {
          throw new Error('Owner account creation failed: ' + signUpErr.message);
        }
      } else {
        user = signUpData.user;
        // Also sign in to ensure active JWT session
        const { data: signInData } = await client.auth.signInWithPassword({
          email: email,
          password: password
        });
        if (signInData && signInData.user) user = signInData.user;
      }

      if (!user) {
        throw new Error('Unable to establish authenticated owner session.');
      }

      console.log('[SmartMenu DB] Owner account verified! User ID:', user.id);

      // 1b. Upsert profile in public.profiles so owner name shows up
      try {
        const { error: profileErr } = await client
          .from('profiles')
          .upsert({
            id: user.id,
            full_name: ownerName,
            phone: ownerPhone,
            email: email
          }, { onConflict: 'id' });
        if (profileErr) console.warn('[SmartMenu DB] Profile upsert notice:', profileErr.message);
        else console.log('[SmartMenu DB] Profile saved for', ownerName);
      } catch (e) { console.warn('[SmartMenu DB] Profile upsert error:', e); }

      // 2. Insert Restaurant into public.restaurants
      const restPayload = {
        owner_id: user.id,
        name: regData.name || 'My Restaurant',
        cuisine: regData.cuisine || 'Modern Indian',
        description: regData.description || '',
        address: regData.address || '',
        city: regData.city || 'Bengaluru',
        postal_code: regData.postalCode || '',
        contact_number: regData.contactNumber || ownerPhone,
        business_email: regData.restaurantEmail || email,
        website: regData.website || '',
        outlets: parseInt(regData.outlets) || 1,
        opening_hours: regData.openingHours || '12:00-23:00',
        plan: regData.plan || 'Growth · Annual',
        logo_url: regData.logo || null
      };

      const { data: newRest, error: restErr } = await client
        .from('restaurants')
        .insert([restPayload])
        .select()
        .single();

      if (restErr) {
        console.error('[SmartMenu DB] Restaurant insert error:', restErr);
        throw new Error('Failed to save restaurant details to database: ' + restErr.message);
      }

      console.log('[SmartMenu DB] Restaurant successfully created in DB! ID:', newRest.id);

      // 3. Seed Starter Dishes for THIS Restaurant in public.dishes
      const starterDishes = [
        { restaurant_id: newRest.id, name: 'Saffron Butter Chicken', category: 'Mains', diet: 'Non-Veg', price: 580, description: 'Charred chicken morsels simmered in a velvet tomato, honey, and Kashmiri saffron reduction.', image_url: 'saffron_butter_chicken.png', in_stock: true },
        { restaurant_id: newRest.id, name: 'Wild Mushroom Pasta', category: 'Mains', diet: 'Veg', price: 520, description: 'Handmade pasta ribbons tossed in white truffle oil, porcini broth, and toasted pine nuts.', image_url: 'wild_mushroom_pasta.png', in_stock: true },
        { restaurant_id: newRest.id, name: 'Garden Burrata Bowl', category: 'Bowls', diet: 'Veg', price: 460, description: 'Artisanal burrata with heirloom tomatoes, basil oil drizzle, and aged balsamic glaze.', image_url: 'garden_burrata_bowl.png', in_stock: true },
        { restaurant_id: newRest.id, name: 'Farfalle Truffle Pasta', category: 'Mains', diet: 'Veg', price: 580, description: 'Bowtie pasta tossed in aged parmesan emulsion with black winter truffle essence.', image_url: 'farfalle_pasta_ar.png', in_stock: true }
      ];

      try {
        const { error: dishSeedErr } = await client.from('dishes').insert(starterDishes);
        if (dishSeedErr) console.warn('[SmartMenu DB] Dishes seed notice:', dishSeedErr.message);
      } catch (e) { console.warn('[SmartMenu DB] Dishes seed error:', e); }

      // 4. Seed initial table standee
      try {
        const { error: standeeSeedErr } = await client.from('table_standees').insert([
          { restaurant_id: newRest.id, table_number: 1, qr_code_url: `https://smartmenu.live/menu/${newRest.id}?table=1`, is_active: true }
        ]);
        if (standeeSeedErr) console.warn('[SmartMenu DB] Standee seed notice:', standeeSeedErr.message);
      } catch (e) { console.warn('[SmartMenu DB] Standee seed error:', e); }

      // Save state
      localStorage.setItem(STORAGE_KEY_REST_ID, newRest.id);
      localStorage.setItem('smartmenu_auth_user', JSON.stringify({ id: user.id, email: user.email, name: ownerName }));
      localStorage.setItem('smartmenu_restaurant', JSON.stringify(newRest));

      return { user, restaurant: newRest };
    },

    // Sign In Owner - ONLY registered users allowed!
    signInOwner: async function (email, password) {
      const client = this.getClient();
      if (!client) throw new Error('Database client not initialized. Please refresh the page.');

      const cleanEmail = email.trim().toLowerCase();
      const { data, error } = await client.auth.signInWithPassword({
        email: cleanEmail,
        password: password
      });

      if (error) {
        throw new Error('Access Denied: Invalid email or password. Only registered restaurant owners can log in.');
      }

      if (!data.user) {
        throw new Error('User account not found.');
      }

      // Fetch restaurant owned by this user
      const { data: restList, error: restErr } = await client
        .from('restaurants')
        .select('*')
        .eq('owner_id', data.user.id)
        .order('created_at', { ascending: false });

      let currentRest = null;
      if (restList && restList.length > 0) {
        currentRest = restList[0];
        localStorage.setItem(STORAGE_KEY_REST_ID, currentRest.id);
        localStorage.setItem('smartmenu_restaurant', JSON.stringify(currentRest));
      }

      localStorage.setItem('smartmenu_auth_user', JSON.stringify({
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.full_name || 'Owner'
      }));

      return { user: data.user, restaurant: currentRest };
    },

    // Sign Out
    signOut: async function () {
      const client = this.getClient();
      if (client) {
        await client.auth.signOut().catch(e => console.warn(e));
      }
      localStorage.removeItem('smartmenu_auth_user');
      localStorage.removeItem(STORAGE_KEY_REST_ID);
    },

    // Step 2 & 4: Save Restaurant profile
    saveRestaurant: async function (restData) {
      const client = this.getClient();
      if (!client) {
        localStorage.setItem('smartmenu_restaurant', JSON.stringify(restData));
        return restData;
      }

      const user = (await client.auth.getUser())?.data?.user;
      const payload = {
        name: restData.name || 'Nara House',
        cuisine: restData.cuisine || 'Modern Indian',
        description: restData.description || '',
        address: restData.address || '',
        city: restData.city || 'Bengaluru',
        postal_code: restData.postal_code || '',
        contact_number: restData.phone || restData.contact_number || '',
        business_email: restData.email || '',
        website: restData.website || '',
        outlets: parseInt(restData.outlets) || 1,
        opening_hours: restData.hours || restData.opening_hours || '12:00-23:00',
        plan: restData.plan || 'Growth · Annual',
        logo_url: restData.logo || null
      };

      if (user) {
        payload.owner_id = user.id;
      }

      const storedRestId = localStorage.getItem(STORAGE_KEY_REST_ID);
      if (storedRestId && storedRestId !== '11111111-1111-1111-1111-111111111111') {
        payload.id = storedRestId;
      }

      const { data, error } = await client
        .from('restaurants')
        .upsert(payload)
        .select()
        .single();

      if (error) {
        console.error('[SmartMenu DB] Save restaurant error:', error);
        throw error;
      }

      if (data && data.id) {
        localStorage.setItem(STORAGE_KEY_REST_ID, data.id);
      }
      return data;
    },

    // Load Restaurant details
    getRestaurant: async function () {
      const client = this.getClient();
      if (!client) {
        return JSON.parse(localStorage.getItem('smartmenu_restaurant')) || null;
      }

      const restId = localStorage.getItem(STORAGE_KEY_REST_ID) || '11111111-1111-1111-1111-111111111111';
      const { data, error } = await client
        .from('restaurants')
        .select('*')
        .eq('id', restId)
        .single();

      if (error) {
        console.warn('[SmartMenu DB] Could not fetch restaurant from DB:', error.message);
        return JSON.parse(localStorage.getItem('smartmenu_restaurant')) || null;
      }

      return data;
    },

    // Fetch Dishes
    getDishes: async function () {
      const client = this.getClient();
      if (!client) {
        return JSON.parse(localStorage.getItem('smartmenu_dishes')) || null;
      }

      const restId = localStorage.getItem(STORAGE_KEY_REST_ID) || '11111111-1111-1111-1111-111111111111';
      const { data, error } = await client
        .from('dishes')
        .select('*')
        .or(`restaurant_id.eq.${restId},restaurant_id.eq.11111111-1111-1111-1111-111111111111`)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[SmartMenu DB] Error fetching dishes:', error.message);
        return JSON.parse(localStorage.getItem('smartmenu_dishes')) || null;
      }

      return data.map(d => ({
        id: d.id,
        name: d.name,
        category: d.category,
        diet: d.diet,
        price: Number(d.price),
        desc: d.description || '',
        img: d.image_url || 'saffron_butter_chicken.png',
        modelUrl: d.model_url || '',
        inStock: d.in_stock
      }));
    },

    // Add New Dish
    addDish: async function (dish) {
      const client = this.getClient();
      if (!client) throw new Error('Database connection not available.');

      const restId = localStorage.getItem(STORAGE_KEY_REST_ID) || '11111111-1111-1111-1111-111111111111';
      const payload = {
        restaurant_id: restId,
        name: dish.name,
        category: dish.category || 'Mains',
        diet: dish.diet || 'Veg',
        price: parseFloat(dish.price) || 0,
        description: dish.desc || '',
        image_url: dish.img || 'saffron_butter_chicken.png',
        model_url: dish.modelUrl || null,
        in_stock: dish.inStock !== false
      };

      const { data, error } = await client
        .from('dishes')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      return {
        id: data.id,
        name: data.name,
        category: data.category,
        diet: data.diet,
        price: Number(data.price),
        desc: data.description,
        img: data.image_url,
        modelUrl: data.model_url,
        inStock: data.in_stock
      };
    },

    // Update Dish Stock Toggle
    toggleDishStock: async function (dishId, inStock) {
      const client = this.getClient();
      if (!client) return;

      if (!dishId.includes('-') || dishId.startsWith('dish-')) return;

      const { error } = await client
        .from('dishes')
        .update({ in_stock: inStock })
        .eq('id', dishId);

      if (error) console.warn('[SmartMenu DB] Toggle stock error:', error.message);
    },

    // Delete Dish
    deleteDish: async function (dishId) {
      const client = this.getClient();
      if (!client) return;

      if (!dishId.includes('-') || dishId.startsWith('dish-')) {
        let local = JSON.parse(localStorage.getItem('smartmenu_dishes')) || [];
        local = local.filter(d => d.id !== dishId);
        localStorage.setItem('smartmenu_dishes', JSON.stringify(local));
        return;
      }

      const { error } = await client
        .from('dishes')
        .delete()
        .eq('id', dishId);

      if (error) throw error;
    }
  };

  // Attach to window object
  window.SmartMenuDB = SupabaseService;

  // Auto-init on page script load
  window.addEventListener('DOMContentLoaded', () => {
    SupabaseService.init();
  });
})(window);
