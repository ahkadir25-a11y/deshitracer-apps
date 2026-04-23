import mongoose from 'mongoose';

const removePhoneNumberIndex = async (): Promise<boolean | Error> => {
    try {
        if (mongoose.connection.readyState !== 1) {
            throw new Error('Database not connected');
        }

        if (!mongoose.connection.db) {
            throw new Error('Database object is undefined on mongoose connection');
        }
        const collections = await mongoose.connection.db.listCollections({ name: 'users' }).toArray();
        if (collections.length === 0) {
            console.warn('⚠️ Collection "users" does not exist. Skipping index drop.');
            return true;
        }

        const userCollection = mongoose.connection.db.collection('users');
        await userCollection.dropIndex('phone_1');
        console.log('✅ Dropped index phone_1');
        return true;
    } catch (error: any) {
        if (error.code === 27 || error.codeName === 'IndexNotFound') {
            console.log('✅ Index "phone_1" not found. Nothing to drop.');
            return true;
        }
        console.error('❌ Error dropping phone_1 index:', error);
        return error;
    }
};

export default removePhoneNumberIndex;
