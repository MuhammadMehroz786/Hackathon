/**
 * User Registry - bridges web registration with phone-based banking
 * Maps email/password credentials to phone numbers
 */
import bcryptjs from 'bcryptjs';

const users = {};
const emailIndex = {};

export function registerUser(name, email, password, phone) {
    if (users[phone]) {
        return { success: false, message: 'Phone number already registered' };
    }
    if (emailIndex[email.toLowerCase()]) {
        return { success: false, message: 'Email already registered' };
    }

    const passwordHash = bcryptjs.hashSync(password, 8);

    users[phone] = {
        name,
        email: email.toLowerCase(),
        passwordHash,
        phone,
        role: 'user',
        createdAt: new Date().toISOString()
    };
    emailIndex[email.toLowerCase()] = phone;

    return { success: true, phone };
}

export function authenticateByEmail(email, password) {
    const phone = emailIndex[email.toLowerCase()];
    if (!phone) return null;
    const user = users[phone];
    if (!user) return null;
    if (!bcryptjs.compareSync(password, user.passwordHash)) return null;
    return { phone: user.phone, name: user.name, email: user.email, role: user.role };
}

export function getUserByPhone(phone) {
    return users[phone] || null;
}

export function isRegistered(phone) {
    return !!users[phone];
}

export function getAllUsers() {
    return Object.values(users).map(u => ({
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        createdAt: u.createdAt
    }));
}

export function seedAdminUser() {
    const adminPhone = '920000000000';
    if (!users[adminPhone]) {
        registerUser('Sarah Malik', 'sarah.malik@jsbank.com', 'admin', adminPhone);
        users[adminPhone].role = 'admin';
        users[adminPhone].title = 'VP Digital Banking';
    }
}
