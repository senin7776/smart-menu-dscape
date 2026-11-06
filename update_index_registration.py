# update_index_registration.py
with open('Smartmenu/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

old_script_part = """    // When clicking "Set up my menu" on Screen 5 -> Commit ALL details to Database!
    window.completeAndOpenDashboard = async function() {
      const btn = event?.currentTarget || document.querySelector('.success-card .btn-primary');
      const origText = btn ? btn.innerHTML : '';
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = 'Registering restaurant in database...';
      }

      const ownerName = document.getElementById('owner-name')?.value?.trim() || 'Aarav Mehta';
      const ownerEmail = document.getElementById('business-email')?.value?.trim() || 'owner@restaurant.com';
      const ownerPhone = document.getElementById('mobile-number')?.value?.trim() || '+91 98765 43210';
      const password = document.getElementById('password')?.value || 'password123';

      const name = document.getElementById('restaurant-name')?.value?.trim() || 'Nara House';
      const cuisine = document.getElementById('cuisine-category')?.value || 'Modern Indian';
      const description = document.getElementById('description')?.value?.trim() || '';
      const address = document.getElementById('full-address')?.value?.trim() || '';
      const city = document.getElementById('city')?.value?.trim() || 'Bengaluru';
      const postalCode = document.getElementById('postal-code')?.value?.trim() || '560025';
      const contactNumber = document.getElementById('contact-number')?.value?.trim() || ownerPhone;
      const restaurantEmail = document.getElementById('restaurant-email')?.value?.trim() || ownerEmail;
      const website = document.getElementById('website')?.value?.trim() || '';
      const outlets = parseInt(document.getElementById('tables')?.value) || 1;
      const openingHours = document.getElementById('operating-hours')?.value || '12:00-23:00';
      const plan = appRestaurant.plan || 'Growth · Annual';
      const logo = appRestaurant.logo || null;

      try {
        const regPayload = {
          ownerName,
          ownerEmail,
          ownerPhone,
          password,
          name,
          cuisine,
          description,
          address,
          city,
          postalCode,
          contactNumber,
          restaurantEmail,
          website,
          outlets,
          openingHours,
          plan,
          logo
        };

        const result = await window.SmartMenuDB.registerRestaurantAndOwner(regPayload);
        if (result && result.restaurant) {
          appRestaurant = result.restaurant;
          localStorage.setItem('smartmenu_restaurant', JSON.stringify(appRestaurant));
        }

        closeRegistrationModal();
        // Open Dashboard on Menu Manager tab
        await showDashboardView('menu');
      } catch (err) {
        alert('Database registration error: ' + err.message);
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = origText;
        }
      }
    };

    /* --- FORM SUBMISSION WIRING --- */
    function initOnboarding() {
      const f1 = document.getElementById('form-step-1');
      if (f1) {
        f1.onsubmit = function(e) {
          e.preventDefault();
          const p1 = document.getElementById('password').value;
          const p2 = document.getElementById('confirm-password').value;
          if (!p1 || !p2) { alert('Please enter both passwords.'); return false; }
          if (p1 !== p2) { alert('Passwords do not match. Please re-enter.'); return false; }
          if (p1.length < 8) { alert('Password must be at least 8 characters long.'); return false; }
          if (!document.getElementById('terms-accept').checked) { alert('Please accept the Terms to continue.'); return false; }
          nextStep();
          return false;
        };
      }

      const f2 = document.getElementById('form-step-2');
      if (f2) {
        f2.onsubmit = function(e) {
          e.preventDefault();
          const name = document.getElementById('restaurant-name').value.trim();
          if (name) appRestaurant.name = name;
          nextStep();
          return false;
        };
      }

      const f3 = document.getElementById('form-step-3');
      if (f3) {
        f3.onsubmit = function(e) {
          e.preventDefault();
          nextStep();
          return false;
        };
      }

      const f4 = document.getElementById('form-step-4');
      if (f4) {
        f4.onsubmit = function(e) {
          e.preventDefault();
          // Step 4 verified -> Show Screen 5 (Success screen) with ALL steps marked completed!
          goToStep('success');

          // Update details on success screen
          const name = document.getElementById('restaurant-name')?.value.trim() || 'Nara House';
          const nameEl = document.getElementById('success-restaurant-name');
          if (nameEl) nameEl.textContent = name;
          const infoName = document.getElementById('success-info-restaurant');
          if (infoName) infoName.textContent = name;
          const infoPlan = document.getElementById('success-info-plan');
          if (infoPlan) infoPlan.textContent = appRestaurant.plan || 'Growth · Annual';

          return false;
        };
      }"""

new_script_part = """    window.registrationData = {
      ownerName: 'Aarav Mehta',
      ownerEmail: 'owner@restaurant.com',
      ownerPhone: '+91 98765 43210',
      password: 'password123',
      name: 'Nara House',
      cuisine: 'Modern Indian',
      description: 'Modern progressive Indian dining celebrating regional spices.',
      address: '24 Residency Road',
      city: 'Bengaluru',
      postalCode: '560025',
      contactNumber: '+91 80 1234 5678',
      restaurantEmail: 'hello@narahouse.in',
      website: 'narahouse.in',
      outlets: 1,
      openingHours: '12:00-23:00',
      plan: 'Growth · Annual',
      logo: null
    };

    // When clicking "Set up my menu" on Screen 5
    window.completeAndOpenDashboard = async function() {
      const btn = document.querySelector('.success-card .btn-primary') || document.querySelector('#step-success button');
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Opening dashboard...';
      }

      // Ensure registration was committed to database
      if (!localStorage.getItem('smartmenu_auth_user')) {
        try {
          const res = await window.SmartMenuDB.registerRestaurantAndOwner(window.registrationData);
          if (res && res.restaurant) {
            appRestaurant = res.restaurant;
            localStorage.setItem('smartmenu_restaurant', JSON.stringify(appRestaurant));
          }
        } catch (e) {
          console.warn('Registration save notice:', e);
        }
      }

      closeRegistrationModal();
      await showDashboardView('menu');
    };

    /* --- FORM SUBMISSION WIRING --- */
    function initOnboarding() {
      const f1 = document.getElementById('form-step-1');
      if (f1) {
        f1.onsubmit = function(e) {
          e.preventDefault();
          const p1 = document.getElementById('password').value;
          const p2 = document.getElementById('confirm-password').value;
          if (!p1 || !p2) { alert('Please enter both passwords.'); return false; }
          if (p1 !== p2) { alert('Passwords do not match. Please re-enter.'); return false; }
          if (p1.length < 8) { alert('Password must be at least 8 characters long.'); return false; }
          if (!document.getElementById('terms-accept').checked) { alert('Please accept the Terms to continue.'); return false; }

          window.registrationData.ownerName = document.getElementById('owner-name')?.value?.trim() || 'Aarav Mehta';
          window.registrationData.ownerEmail = document.getElementById('business-email')?.value?.trim() || 'owner@restaurant.com';
          window.registrationData.ownerPhone = document.getElementById('mobile-number')?.value?.trim() || '+91 98765 43210';
          window.registrationData.password = p1;

          nextStep();
          return false;
        };
      }

      const f2 = document.getElementById('form-step-2');
      if (f2) {
        f2.onsubmit = function(e) {
          e.preventDefault();
          const name = document.getElementById('restaurant-name')?.value?.trim() || 'Nara House';
          window.registrationData.name = name;
          window.registrationData.cuisine = document.getElementById('cuisine-category')?.value || 'Modern Indian';
          window.registrationData.description = document.getElementById('description')?.value?.trim() || '';
          window.registrationData.address = document.getElementById('full-address')?.value?.trim() || '';
          window.registrationData.city = document.getElementById('city')?.value?.trim() || 'Bengaluru';
          window.registrationData.postalCode = document.getElementById('postal-code')?.value?.trim() || '';
          window.registrationData.contactNumber = document.getElementById('contact-number')?.value?.trim() || window.registrationData.ownerPhone;
          window.registrationData.restaurantEmail = document.getElementById('restaurant-email')?.value?.trim() || window.registrationData.ownerEmail;
          window.registrationData.website = document.getElementById('website')?.value?.trim() || '';
          window.registrationData.outlets = parseInt(document.getElementById('tables')?.value) || 1;
          window.registrationData.openingHours = document.getElementById('operating-hours')?.value || '12:00-23:00';
          window.registrationData.logo = appRestaurant.logo || null;

          appRestaurant.name = name;
          nextStep();
          return false;
        };
      }

      const f3 = document.getElementById('form-step-3');
      if (f3) {
        f3.onsubmit = function(e) {
          e.preventDefault();
          window.registrationData.plan = appRestaurant.plan || 'Growth · Annual';
          nextStep();
          return false;
        };
      }

      const f4 = document.getElementById('form-step-4');
      if (f4) {
        f4.onsubmit = async function(e) {
          e.preventDefault();
          const submitBtn = f4.querySelector('button[type="submit"]');
          const origText = submitBtn ? submitBtn.innerHTML : '';
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Connecting to database & creating account...';
          }

          try {
            console.log('[SmartMenu] Committing registration data to Supabase:', window.registrationData);
            const result = await window.SmartMenuDB.registerRestaurantAndOwner(window.registrationData);
            if (result && result.restaurant) {
              appRestaurant = result.restaurant;
              localStorage.setItem('smartmenu_restaurant', JSON.stringify(appRestaurant));
            }
            console.log('[SmartMenu] Registration successful in database!');
          } catch (err) {
            console.error('[SmartMenu] Database registration error:', err);
            alert('Database Notice: ' + err.message);
          } finally {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.innerHTML = origText;
            }
          }

          // Step 4 verified -> Show Screen 5 (Success screen) with ALL steps marked completed!
          goToStep('success');

          // Update details on success screen
          const name = window.registrationData.name || 'Nara House';
          const nameEl = document.getElementById('success-restaurant-name');
          if (nameEl) nameEl.textContent = name;
          const infoName = document.getElementById('success-info-restaurant');
          if (infoName) infoName.textContent = name;
          const infoPlan = document.getElementById('success-info-plan');
          if (infoPlan) infoPlan.textContent = window.registrationData.plan || 'Growth · Annual';

          return false;
        };
      }"""

content_norm = content.replace('\r\n', '\n')
old_norm = old_script_part.replace('\r\n', '\n')

if old_norm in content_norm:
    content_norm = content_norm.replace(old_norm, new_script_part.replace('\r\n', '\n'))
    with open('Smartmenu/index.html', 'w', encoding='utf-8') as f:
        f.write(content_norm)
    print("[OK] Updated index.html registration pipeline")
else:
    print("[FAIL] Could not match script part")
