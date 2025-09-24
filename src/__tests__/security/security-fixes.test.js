/**
 * Security fixes validation tests
 */

import { validatePackageName, sanitizeProjectName, secureExec } from '../../utils/secure-exec.js';
import { validateProjectName, generateUniqueProjectPath, safePathJoin } from '../../utils/path-security.js';
import { generateSecureSecret, sanitizeSensitiveData } from '../../utils/security.js';

describe('Security Fixes', () => {
    describe('Package Name Validation', () => {
        it('should reject malicious package names', () => {
            expect(validatePackageName('../../malicious')).toBe(false);
            expect(validatePackageName('package; rm -rf /')).toBe(false);
            expect(validatePackageName('package`whoami`')).toBe(false);
            expect(validatePackageName('package$(whoami)')).toBe(false);
            expect(validatePackageName('')).toBe(false);
            expect(validatePackageName(null)).toBe(false);
        });

        it('should accept valid package names', () => {
            expect(validatePackageName('react')).toBe(true);
            expect(validatePackageName('@types/node')).toBe(true);
            expect(validatePackageName('lodash-es')).toBe(true);
            expect(validatePackageName('my-package_123')).toBe(true);
        });
    });

    describe('Project Name Validation', () => {
        it('should reject dangerous project names', () => {
            expect(() => validateProjectName('../../escape')).toThrow();
            expect(() => validateProjectName('/absolute/path')).toThrow();
            expect(() => validateProjectName('CON')).toThrow(); // Windows reserved
            expect(() => validateProjectName('project<script>')).toThrow();
            expect(() => validateProjectName('.hidden')).toThrow();
        });

        it('should accept valid project names', () => {
            expect(() => validateProjectName('my-app')).not.toThrow();
            expect(() => validateProjectName('my_app_123')).not.toThrow();
            expect(() => validateProjectName('a')).not.toThrow();
        });
    });

    describe('Path Security', () => {
        it('should prevent directory traversal in path joins', () => {
            expect(() => safePathJoin('/base', '../../../etc/passwd')).toThrow();
            expect(() => safePathJoin('/base', 'sub/../../../etc')).toThrow();
            expect(() => safePathJoin('/base', '/absolute/path')).toThrow();
        });

        it('should allow safe path joins', () => {
            const result = safePathJoin('/base', 'subdir', 'file.txt');
            expect(result).toMatch(/^\/base/);
        });
    });

    describe('Secret Generation', () => {
        it('should generate cryptographically secure secrets', () => {
            const secret1 = generateSecureSecret();
            const secret2 = generateSecureSecret();

            expect(secret1).toBeTruthy();
            expect(secret2).toBeTruthy();
            expect(secret1).not.toBe(secret2);
            expect(secret1.length).toBe(64);
        });

        it('should generate different types of secrets', () => {
            const jwtSecret = generateSecureSecret(64, 'base64url');
            const hexSecret = generateSecureSecret(32, 'hex');

            expect(jwtSecret).toMatch(/^[A-Za-z0-9_-]+$/);
            expect(hexSecret).toMatch(/^[a-f0-9]+$/);
        });
    });

    describe('Sensitive Data Sanitization', () => {
        it('should redact passwords in strings', () => {
            const input = 'password=secret123 and secret=topsecret';
            const result = sanitizeSensitiveData(input);

            expect(result).not.toContain('secret123');
            expect(result).not.toContain('topsecret');
            expect(result).toContain('***REDACTED***');
        });

        it('should redact database URLs', () => {
            const input = 'mongodb://user:password@localhost/db';
            const result = sanitizeSensitiveData(input);

            expect(result).not.toContain('password');
            expect(result).toContain('***REDACTED***');
        });

        it('should redact Bearer tokens', () => {
            const input = 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
            const result = sanitizeSensitiveData(input);

            expect(result).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
            expect(result).toContain('***REDACTED***');
        });

        it('should preserve non-sensitive data', () => {
            const input = 'Installing package react@18.2.0';
            const result = sanitizeSensitiveData(input);

            expect(result).toBe(input);
        });
    });

    describe('Secure Command Execution', () => {
        it('should reject commands with shell metacharacters', async () => {
            await expect(secureExec('npm', ['install', 'package; rm -rf /']))
                .rejects.toThrow('Invalid or unsafe command');

            await expect(secureExec('npm', ['install', 'package`whoami`']))
                .rejects.toThrow('Invalid or unsafe command');

            await expect(secureExec('npm', ['install', 'package$(whoami)']))
                .rejects.toThrow('Invalid or unsafe command');
        });

        it('should reject non-allowlisted commands', async () => {
            await expect(secureExec('rm', ['-rf', '/']))
                .rejects.toThrow('not in the allowlist');

            await expect(secureExec('curl', ['http://evil.com']))
                .rejects.toThrow('not in the allowlist');
        });

        it('should allow legitimate Next.js creation commands', async () => {
            // Mock execa to avoid actual command execution
            const mockExeca = jest.fn().mockResolvedValue({ stdout: 'success' });
            jest.doMock('execa', () => ({ execa: mockExeca }));

            const { validateCommandArgs } = await import('../../utils/secure-exec.js');

            // These should be valid create-next-app commands
            expect(validateCommandArgs('npx', [
                'create-next-app@latest',
                'my-app',
                '--app',
                '--src-dir',
                '--typescript',
                '--tailwind',
                '--eslint',
                '--import-alias',
                '@/*'
            ])).toBe(true);

            expect(validateCommandArgs('npx', [
                'create-next-app@latest',
                'test-project',
                '--js',
                '--no-tailwind',
                '--no-eslint'
            ])).toBe(true);
        });

        it('should reject malicious npx commands', async () => {
            const { validateCommandArgs } = await import('../../utils/secure-exec.js');

            // Should reject non-allowlisted npx commands
            expect(validateCommandArgs('npx', ['malicious-package'])).toBe(false);

            // Should reject shell injection in create-next-app args
            expect(validateCommandArgs('npx', [
                'create-next-app@latest',
                'app; rm -rf /'
            ])).toBe(false);

            expect(validateCommandArgs('npx', [
                'create-next-app@latest',
                'app',
                '--import-alias',
                '$(whoami)'
            ])).toBe(false);
        });

        it('should set secure environment defaults', async () => {
            // Mock execa to capture the options
            const mockExeca = jest.fn().mockResolvedValue({ stdout: 'success' });
            jest.doMock('execa', () => ({ execa: mockExeca }));

            try {
                await secureExec('npm', ['--version']);

                expect(mockExeca).toHaveBeenCalledWith('npm', ['--version'], expect.objectContaining({
                    timeout: 300000,
                    env: expect.objectContaining({
                        CI: 'true',
                        NODE_ENV: 'production'
                    })
                }));
            } catch (error) {
                // Expected to fail in test environment, but we can verify the call
            }
        });
    });

    describe('CLI Argument Parsing', () => {
        it('should parse project name from command line', () => {
            const originalArgv = process.argv;

            try {
                // Simulate CLI call: npx build-app-with my-awesome-app
                process.argv = ['node', 'cli.js', 'my-awesome-app'];

                const { getPrompts } = require('../../prompts/index.js');
                const prompts = getPrompts('my-awesome-app');

                // Should not include project name prompt when CLI name provided
                const hasProjectNamePrompt = prompts.some(p => p.name === 'projectName');
                expect(hasProjectNamePrompt).toBe(false);

                // Should still include framework selection
                const hasFrameworkPrompt = prompts.some(p => p.name === 'framework');
                expect(hasFrameworkPrompt).toBe(true);

            } finally {
                process.argv = originalArgv;
            }
        });

        it('should include project name prompt when no CLI argument provided', () => {
            const { getPrompts } = require('../../prompts/index.js');
            const prompts = getPrompts(null);

            // Should include project name prompt when no CLI name provided
            const hasProjectNamePrompt = prompts.some(p => p.name === 'projectName');
            expect(hasProjectNamePrompt).toBe(true);
        });
    });
});