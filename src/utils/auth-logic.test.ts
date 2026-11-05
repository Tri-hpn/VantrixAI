import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateLoginForm,
  validateRegisterForm,
  validateForgotPassword,
  validateResetPassword,
  calculatePasswordStrength,
} from './auth-logic';

test('validateLoginForm checks required fields and password length', () => {
  assert.equal(validateLoginForm('', '123456').valid, false);
  assert.equal(validateLoginForm('user@gmail.com', '123').valid, false);
  assert.equal(validateLoginForm('user@gmail.com', '123456').valid, true);
});

test('validateRegisterForm verifies full registration constraints', () => {
  const base = {
    name: 'Nguyễn Văn A',
    email: 'nva@edu.vn',
    role: 'student' as const,
    educationLevel: 'thpt' as const,
    gradeOrClass: '12A1',
    schoolOrOrg: 'THPT Chu Văn An',
    password: 'password123',
    confirmPassword: 'password123',
    agreeTerms: true,
  };

  assert.equal(validateRegisterForm(base).valid, true);
  assert.equal(validateRegisterForm({ ...base, name: 'A' }).valid, false);
  assert.equal(validateRegisterForm({ ...base, email: 'invalid-email' }).valid, false);
  assert.equal(validateRegisterForm({ ...base, password: '123' }).valid, false);
  assert.equal(validateRegisterForm({ ...base, confirmPassword: 'mismatch' }).valid, false);
  assert.equal(validateRegisterForm({ ...base, agreeTerms: false }).valid, false);
});

test('validateForgotPassword and validateResetPassword check emails and OTP', () => {
  assert.equal(validateForgotPassword('invalid').valid, false);
  assert.equal(validateForgotPassword('test@quizflow.edu.vn').valid, true);

  assert.equal(validateResetPassword('123', 'newpass123', 'newpass123').valid, false);
  assert.equal(validateResetPassword('123456', '123', '123').valid, false);
  assert.equal(validateResetPassword('123456', 'newpass123', 'diffpass').valid, false);
  assert.equal(validateResetPassword('123456', 'newpass123', 'newpass123').valid, true);
});

test('calculatePasswordStrength evaluates criteria properly', () => {
  assert.equal(calculatePasswordStrength('').score, 0);
  assert.equal(calculatePasswordStrength('123456').score, 1);
  assert.ok(calculatePasswordStrength('pass1234').score >= 2);
  assert.equal(calculatePasswordStrength('StrongP@ssw0rd!').score, 4);
});
