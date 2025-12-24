# 🎯 Dashboard Testing Guide

## ✅ Setup Complete!

I've created everything you need to test the dashboard:

### Test Account Created:
```
Email: owner@test.com
Password: owner123
Restaurant: Test Restaurant
Tables: 10 (T-01 to T-10)
```

### Menu Items Added (5):
1. Margherita Pizza - ₹350 (Main)
2. Caesar Salad - ₹200 (Starter)
3. Grilled Chicken - ₹450 (Main)
4. Chocolate Lava Cake - ₹180 (Dessert)
5. Fresh Lemonade - ₹80 (Drink)

---

## 🧪 Step-by-Step Testing Process

### Step 1: Login
1. Open `http://localhost:3000/login/`
2. Enter credentials:
   - Email: `owner@test.com`
   - Password: `owner123`
3. Click **Login**
4. You should be redirected to the dashboard

### Step 2: Verify Dashboard Loads
After login, check that:
- ✅ Stats cards show numbers (may be ₹0 if no orders yet)
- ✅ Recent Orders table appears (may be empty)
- ✅ Kitchen Load shows percentage
- ✅ No JavaScript errors in browser console (F12)

### Step 3: Test Menu Section
1. Click **"Menu Management"** in sidebar
2. Verify you see 5 menu items
3. Try:
   - ✅ Toggle availability switch on any item
   - ✅ Click **Edit** button → Modal should open with item details
   - ✅ Click **Add New Item** button → Modal should open

### Step 4: Test Tables & Zones
1. Click **"Tables & Zones"** in sidebar
2. You should see 10 tables (T-01 to T-10) in green (all empty)
3. **Click on any table** (e.g., T-01)
4. A modal should appear with:
   - Title: "New Order for T-01"
   - Dropdown: Menu items to select
   - Quantity field

### Step 5: **CREATE ORDER** (Critical Test!)
1. In the modal that appeared:
   - Select "Margherita Pizza | ₹350"
   - Enter quantity: **1**
   - Click **"Place Order"**
   
2. **Expected Results:**
   - Modal closes
   - Table T-01 turns **RED** (occupied)
   - Order is created

### Step 6: Verify Order in Live Orders
1. Click **"Live Orders"** in sidebar
2. **CHECK:** You should now see:
   - **New Orders column**: 1 order for Table T-01
   - Order shows: "#ORD-XXXX", Margherita Pizza, ₹350
   - Button: "Start Cooking"

### Step 7: Test Order Flow
1. Click **"Start Cooking"** button
2. Order should move to **"Cooking"** column
3. Click **"Mark Ready"** button
4. Order should move to **"Ready"** column
5. Click **"Serve"** button
6. Order should disappear (marked as Served)

### Step 8: Verify Dashboard Updates
1. Go back to **"Dashboard"** (Overview)
2. Check that stats updated:
   - Total Revenue: ₹350
   - Total Orders: 1
   - Recent Orders shows your order

### Step 9: Check Tables Again
1. Go to **"Tables & Zones"**
2. Table T-01 should now be **GREEN** again (empty, since order was served)

---

## 🐛 Troubleshooting

### If Modal Doesn't Appear When Clicking Table:
1. Open browser console (F12)
2. Look for errors like:
   - `Failed to fetch /api/v1/menu`
   - `Restaurant details not loaded`
3. Refresh the page and try again

### If Order Doesn't Appear in Live Orders:
1. Check browser console for errors
2. Try manually navigating to Live Orders
3. Click refresh button (if any) or refresh page

### If You Get "Unauthorized" or 401 Errors:
1. You may have been logged out
2. Go back to `/login/` and log in again
3. Ensure localStorage has `token` and `user` keys (check via F12 → Application → Local Storage)

---

## ✅ Success Criteria

The dashboard is working correctly if you can:
1. ✅ Login successfully
2. ✅ See menu items in Menu Management
3. ✅ Click a table → Modal appears
4. ✅ Place order → Table turns red
5. ✅ **Order appears in Live Orders "New" column** ← **MAIN TEST!**
6. ✅ Move order through workflow (New → Cooking → Ready → Served)
7. ✅ Dashboard stats update after order
8. ✅ Table returns to green after serving

---

## 🔑 Quick Commands

If you need to reset and test again:

```powershell
# Re-create test data
cd backend
node create-test-owner.js   # Creates owner + restaurant
node create-test-menu.js     # Adds menu items
```

---

**Start with Step 1 and work through each step. The critical test is Step 6 - if the order appears in Live Orders, everything is working! 🎉**
