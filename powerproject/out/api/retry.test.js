"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
require("should");
const retry_1 = require("./retry");
(0, mocha_1.describe)("Retry Decorator", () => {
    (0, mocha_1.describe)("withRetry", () => {
        (0, mocha_1.it)("should not retry on success", async () => {
            let callCount = 0;
            class TestClass {
                async *successMethod() {
                    callCount++;
                    yield "success";
                }
            }
            __decorate([
                (0, retry_1.withRetry)(),
                __metadata("design:type", Function),
                __metadata("design:paramtypes", []),
                __metadata("design:returntype", void 0)
            ], TestClass.prototype, "successMethod", null);
            const test = new TestClass();
            const result = [];
            for await (const value of test.successMethod()) {
                result.push(value);
            }
            callCount.should.equal(1);
            result.should.deepEqual(["success"]);
        });
        (0, mocha_1.it)("should retry on rate limit (429) error", async () => {
            let callCount = 0;
            class TestClass {
                async *failMethod() {
                    callCount++;
                    if (callCount === 1) {
                        const error = new Error("Rate limit exceeded");
                        error.status = 429;
                        throw error;
                    }
                    yield "success after retry";
                }
            }
            __decorate([
                (0, retry_1.withRetry)({ maxRetries: 2, baseDelay: 10, maxDelay: 100 }),
                __metadata("design:type", Function),
                __metadata("design:paramtypes", []),
                __metadata("design:returntype", void 0)
            ], TestClass.prototype, "failMethod", null);
            const test = new TestClass();
            const result = [];
            for await (const value of test.failMethod()) {
                result.push(value);
            }
            callCount.should.equal(2);
            result.should.deepEqual(["success after retry"]);
        });
        (0, mocha_1.it)("should not retry on non-rate-limit errors", async () => {
            let callCount = 0;
            class TestClass {
                async *failMethod() {
                    callCount++;
                    throw new Error("Regular error");
                }
            }
            __decorate([
                (0, retry_1.withRetry)(),
                __metadata("design:type", Function),
                __metadata("design:paramtypes", []),
                __metadata("design:returntype", void 0)
            ], TestClass.prototype, "failMethod", null);
            const test = new TestClass();
            try {
                for await (const _ of test.failMethod()) {
                    // Should not reach here
                }
                throw new Error("Should have thrown");
            }
            catch (error) {
                error.message.should.equal("Regular error");
                callCount.should.equal(1);
            }
        });
        (0, mocha_1.it)("should respect retry-after header with delta seconds", async () => {
            let callCount = 0;
            const startTime = Date.now();
            class TestClass {
                async *failMethod() {
                    callCount++;
                    if (callCount === 1) {
                        const error = new Error("Rate limit exceeded");
                        error.status = 429;
                        error.headers = { "retry-after": "0.01" }; // 10ms delay
                        throw error;
                    }
                    yield "success after retry";
                }
            }
            __decorate([
                (0, retry_1.withRetry)({ maxRetries: 2, baseDelay: 1000 }) // Use large baseDelay to ensure header takes precedence
                ,
                __metadata("design:type", Function),
                __metadata("design:paramtypes", []),
                __metadata("design:returntype", void 0)
            ], TestClass.prototype, "failMethod", null);
            const test = new TestClass();
            const result = [];
            for await (const value of test.failMethod()) {
                result.push(value);
            }
            const duration = Date.now() - startTime;
            duration.should.be.approximately(10, 10); // Allow 10ms variance
            callCount.should.equal(2);
            result.should.deepEqual(["success after retry"]);
        });
        (0, mocha_1.it)("should respect retry-after header with Unix timestamp", async () => {
            let callCount = 0;
            const startTime = Date.now();
            const retryTimestamp = Math.floor(Date.now() / 1000) + 0.01; // 10ms in the future
            class TestClass {
                async *failMethod() {
                    callCount++;
                    if (callCount === 1) {
                        const error = new Error("Rate limit exceeded");
                        error.status = 429;
                        error.headers = { "retry-after": retryTimestamp.toString() };
                        throw error;
                    }
                    yield "success after retry";
                }
            }
            __decorate([
                (0, retry_1.withRetry)({ maxRetries: 2, baseDelay: 1000 }) // Use large baseDelay to ensure header takes precedence
                ,
                __metadata("design:type", Function),
                __metadata("design:paramtypes", []),
                __metadata("design:returntype", void 0)
            ], TestClass.prototype, "failMethod", null);
            const test = new TestClass();
            const result = [];
            for await (const value of test.failMethod()) {
                result.push(value);
            }
            const duration = Date.now() - startTime;
            duration.should.be.approximately(10, 10); // Allow 10ms variance
            callCount.should.equal(2);
            result.should.deepEqual(["success after retry"]);
        });
        (0, mocha_1.it)("should use exponential backoff when no retry-after header", async () => {
            let callCount = 0;
            const startTime = Date.now();
            class TestClass {
                async *failMethod() {
                    callCount++;
                    if (callCount === 1) {
                        const error = new Error("Rate limit exceeded");
                        error.status = 429;
                        throw error;
                    }
                    yield "success after retry";
                }
            }
            __decorate([
                (0, retry_1.withRetry)({ maxRetries: 2, baseDelay: 10, maxDelay: 100 }),
                __metadata("design:type", Function),
                __metadata("design:paramtypes", []),
                __metadata("design:returntype", void 0)
            ], TestClass.prototype, "failMethod", null);
            const test = new TestClass();
            const result = [];
            for await (const value of test.failMethod()) {
                result.push(value);
            }
            const duration = Date.now() - startTime;
            // First retry should be after baseDelay (10ms)
            duration.should.be.approximately(10, 10);
            callCount.should.equal(2);
            result.should.deepEqual(["success after retry"]);
        });
        (0, mocha_1.it)("should respect maxDelay", async () => {
            let callCount = 0;
            const startTime = Date.now();
            class TestClass {
                async *failMethod() {
                    callCount++;
                    if (callCount < 3) {
                        const error = new Error("Rate limit exceeded");
                        error.status = 429;
                        throw error;
                    }
                    yield "success after retries";
                }
            }
            __decorate([
                (0, retry_1.withRetry)({ maxRetries: 3, baseDelay: 50, maxDelay: 10 }),
                __metadata("design:type", Function),
                __metadata("design:paramtypes", []),
                __metadata("design:returntype", void 0)
            ], TestClass.prototype, "failMethod", null);
            const test = new TestClass();
            const result = [];
            for await (const value of test.failMethod()) {
                result.push(value);
            }
            const duration = Date.now() - startTime;
            // Both retries should be capped at maxDelay (10ms each)
            duration.should.be.approximately(20, 20);
            callCount.should.equal(3);
            result.should.deepEqual(["success after retries"]);
        });
        (0, mocha_1.it)("should throw after maxRetries attempts", async () => {
            let callCount = 0;
            class TestClass {
                async *failMethod() {
                    callCount++;
                    const error = new Error("Rate limit exceeded");
                    error.status = 429;
                    throw error;
                }
            }
            __decorate([
                (0, retry_1.withRetry)({ maxRetries: 2, baseDelay: 10 }),
                __metadata("design:type", Function),
                __metadata("design:paramtypes", []),
                __metadata("design:returntype", void 0)
            ], TestClass.prototype, "failMethod", null);
            const test = new TestClass();
            try {
                for await (const _ of test.failMethod()) {
                    // Should not reach here
                }
                throw new Error("Should have thrown");
            }
            catch (error) {
                error.message.should.equal("Rate limit exceeded");
                callCount.should.equal(2); // Initial attempt + 1 retry
            }
        });
    });
});
//# sourceMappingURL=retry.test.js.map