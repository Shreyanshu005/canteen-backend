# Update Canteen Status on EC2 MongoDB

## Option 1: Using MongoDB Shell on EC2 (Quickest)

1. SSH into your EC2 instance:
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

2. Connect to MongoDB:
```bash
mongosh
```

3. Switch to your database (usually 'canteen' or check your MONGO_URI):
```javascript
use canteen
```

4. View current canteen status:
```javascript
db.canteens.find({}, { name: 1, place: 1, isOpen: 1 })
```

5. Update ALL canteens to OPEN:
```javascript
db.canteens.updateMany(
  { isOpen: false },
  { $set: { isOpen: true } }
)
```

6. Verify the update:
```javascript
db.canteens.find({}, { name: 1, place: 1, isOpen: 1 })
```

---

## Option 2: Using MongoDB Compass (GUI)

1. Get your MongoDB connection string from EC2
2. Open MongoDB Compass
3. Connect using: `mongodb://your-ec2-ip:27017/canteen`
4. Navigate to the `canteens` collection
5. Find the document you want to update
6. Edit the `isOpen` field to `true`
7. Save changes

---

## Option 3: Run Script from Local Machine

1. Make sure your EC2 MongoDB port (27017) is accessible from your local machine
2. Update your `.env` file with EC2 MongoDB URI:
```
MONGO_URI=mongodb://your-ec2-ip:27017/canteen
```

3. Run the update script:
```bash
npx ts-node src/scripts/updateCanteenStatus.ts
```

**Note:** This requires your EC2 security group to allow inbound traffic on port 27017 from your IP.

---

## Option 4: Use API Endpoint (If Backend is Running)

If your backend is running on EC2, use the existing API:

```bash
# Get canteen ID first
curl https://your-backend-url/api/v1/canteens

# Toggle status using the API
curl -X PATCH https://your-backend-url/api/v1/canteens/CANTEEN_ID/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Quick MongoDB Commands Reference

```javascript
// List all databases
show dbs

// Switch to canteen database
use canteen

// List all collections
show collections

// Find all canteens
db.canteens.find().pretty()

// Update specific canteen by name
db.canteens.updateOne(
  { name: "Your Canteen Name" },
  { $set: { isOpen: true } }
)

// Update all canteens to open
db.canteens.updateMany(
  {},
  { $set: { isOpen: true } }
)

// Count closed canteens
db.canteens.countDocuments({ isOpen: false })
```
