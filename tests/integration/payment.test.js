const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../../models/schemas/User');
const Order = require('../../models/schemas/Order');

/**
 * 支付流程集成测试
 * 测试范围：订单创建、支付处理、库存扣除、货币发放
 */
describe('支付流程集成测试', () => {
    let mongoServer;
    let testUser;
    
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
    });
    
    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });
    
    beforeEach(async () => {
        // 创建测试用户
        testUser = new User({
            username: 'testuser',
            email: 'test@example.com',
            passwordHash: 'hashedpassword123',
            salt: 'somesalt',
            currency: {
                gems: 100,
                coins: 1000,
                vipPoints: 0
            }
        });
        await testUser.save();
    });
    
    afterEach(async () => {
        await User.deleteMany({});
        await Order.deleteMany({});
    });

    describe('订单创建', () => {
        test('应该成功创建订单', async () => {
            const orderData = {
                orderId: Order.generateOrderId(),
                userId: testUser._id,
                items: [{
                    itemId: 'gems_100',
                    itemType: 'gems',
                    name: '100宝石',
                    quantity: 1,
                    unitPrice: 600, // 6元
                    totalPrice: 600
                }],
                subtotal: 600,
                totalAmount: 600,
                currency: 'CNY'
            };
            
            const order = new Order(orderData);
            await order.save();
            
            expect(order._id).toBeDefined();
            expect(order.status).toBe('pending');
            expect(order.payment.status).toBe('pending');
        });
        
        test('应该正确计算订单金额', async () => {
            const order = new Order({
                orderId: Order.generateOrderId(),
                userId: testUser._id,
                items: [
                    {
                        itemId: 'gems_100',
                        itemType: 'gems',
                        name: '100宝石',
                        quantity: 2,
                        unitPrice: 600,
                        totalPrice: 1200
                    },
                    {
                        itemId: 'coins_1000',
                        itemType: 'coins',
                        name: '1000金币',
                        quantity: 1,
                        unitPrice: 100,
                        totalPrice: 100
                    }
                ],
                subtotal: 1300,
                discount: 100,
                totalAmount: 1200,
                currency: 'CNY'
            });
            
            await order.save();
            
            expect(order.subtotal).toBe(1300);
            expect(order.discount).toBe(100);
            expect(order.totalAmount).toBe(1200);
        });
        
        test('应该自动生成唯一订单号', async () => {
            const orderId1 = Order.generateOrderId();
            const orderId2 = Order.generateOrderId();
            
            expect(orderId1).toMatch(/^TOF\d{8}[A-Z0-9]{8}$/);
            expect(orderId1).not.toBe(orderId2);
        });
        
        test('订单号应该包含日期信息', async () => {
            const orderId = Order.generateOrderId();
            const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            
            expect(orderId).toContain(today);
        });
    });

    describe('支付处理', () => {
        let order;
        
        beforeEach(async () => {
            order = new Order({
                orderId: Order.generateOrderId(),
                userId: testUser._id,
                items: [{
                    itemId: 'gems_100',
                    itemType: 'gems',
                    name: '100宝石',
                    quantity: 1,
                    unitPrice: 600,
                    totalPrice: 600
                }],
                subtotal: 600,
                totalAmount: 600
            });
            await order.save();
        });
        
        test('应该成功处理支付回调', async () => {
            const paymentData = {
                method: 'alipay',
                transactionId: '202401011200000001',
                amount: 600,
                paidAt: new Date()
            };
            
            await order.processPayment(paymentData);
            
            expect(order.payment.status).toBe('paid');
            expect(order.payment.method).toBe('alipay');
            expect(order.payment.transactionId).toBe('202401011200000001');
            expect(order.status).toBe('paid');
        });
        
        test('支付金额不匹配应该抛出错误', async () => {
            const paymentData = {
                method: 'alipay',
                transactionId: '202401011200000001',
                amount: 500, // 错误的金额
                paidAt: new Date()
            };
            
            await expect(order.processPayment(paymentData))
                .rejects.toThrow('支付金额不匹配');
        });
        
        test('支持多种支付方式', async () => {
            const methods = ['alipay', 'wechat', 'apple', 'google'];
            
            for (const method of methods) {
                const newOrder = new Order({
                    orderId: Order.generateOrderId(),
                    userId: testUser._id,
                    items: [{
                        itemId: 'gems_100',
                        itemType: 'gems',
                        name: '100宝石',
                        quantity: 1,
                        unitPrice: 600,
                        totalPrice: 600
                    }],
                    subtotal: 600,
                    totalAmount: 600
                });
                await newOrder.save();
                
                await newOrder.processPayment({
                    method,
                    transactionId: `TRANS_${method}`,
                    amount: 600,
                    paidAt: new Date()
                });
                
                expect(newOrder.payment.method).toBe(method);
            }
        });
    });

    describe('订单完成流程', () => {
        let order;
        
        beforeEach(async () => {
            order = new Order({
                orderId: Order.generateOrderId(),
                userId: testUser._id,
                items: [{
                    itemId: 'gems_100',
                    itemType: 'gems',
                    name: '100宝石',
                    quantity: 1,
                    unitPrice: 600,
                    totalPrice: 600
                }],
                subtotal: 600,
                totalAmount: 600,
                payment: {
                    status: 'paid',
                    method: 'alipay',
                    transactionId: 'TRANS001',
                    paidAt: new Date()
                }
            });
            await order.save();
        });
        
        test('已支付订单应该能完成', async () => {
            await order.complete();
            
            expect(order.status).toBe('completed');
            expect(order.delivery.status).toBe('delivered');
            expect(order.delivery.deliveredAt).toBeDefined();
        });
        
        test('未支付订单不应该能完成', async () => {
            order.payment.status = 'pending';
            
            await expect(order.complete())
                .rejects.toThrow('订单未支付');
        });
    });

    describe('退款流程', () => {
        let order;
        
        beforeEach(async () => {
            order = new Order({
                orderId: Order.generateOrderId(),
                userId: testUser._id,
                items: [{
                    itemId: 'gems_100',
                    itemType: 'gems',
                    name: '100宝石',
                    quantity: 1,
                    unitPrice: 600,
                    totalPrice: 600
                }],
                subtotal: 600,
                totalAmount: 600,
                status: 'completed',
                payment: {
                    status: 'paid',
                    method: 'alipay',
                    transactionId: 'TRANS001',
                    paidAt: new Date()
                }
            });
            await order.save();
        });
        
        test('应该能申请退款', async () => {
            await order.requestRefund('用户申请退款');
            
            expect(order.payment.refundReason).toBe('用户申请退款');
            expect(order.status).toBe('disputed');
        });
        
        test('应该能处理全额退款', async () => {
            await order.requestRefund('用户申请退款');
            await order.processRefund(600);
            
            expect(order.payment.refundAmount).toBe(600);
            expect(order.payment.status).toBe('refunded');
            expect(order.status).toBe('refunded');
            expect(order.payment.refundedAt).toBeDefined();
        });
        
        test('应该能处理部分退款', async () => {
            await order.processRefund(200);
            
            expect(order.payment.refundAmount).toBe(200);
            expect(order.payment.status).toBe('partial_refunded');
        });
        
        test('退款金额不应该超过订单金额', async () => {
            await order.processRefund(400);
            
            await expect(order.processRefund(300))
                .rejects.toThrow('退款金额超过可退金额');
        });
        
        test('未支付订单不应该能申请退款', async () => {
            order.payment.status = 'pending';
            order.status = 'pending';
            
            await expect(order.requestRefund('test'))
                .rejects.toThrow('只有已支付订单可申请退款');
        });
    });

    describe('订单取消', () => {
        let order;
        
        beforeEach(async () => {
            order = new Order({
                orderId: Order.generateOrderId(),
                userId: testUser._id,
                items: [{
                    itemId: 'gems_100',
                    itemType: 'gems',
                    name: '100宝石',
                    quantity: 1,
                    unitPrice: 600,
                    totalPrice: 600
                }],
                subtotal: 600,
                totalAmount: 600,
                status: 'pending',
                payment: { status: 'pending' }
            });
            await order.save();
        });
        
        test('应该能取消待支付订单', async () => {
            await order.cancel('用户取消');
            
            expect(order.status).toBe('cancelled');
        });
        
        test('不应该能取消已支付订单', async () => {
            order.status = 'completed';
            
            await expect(order.cancel('test'))
                .rejects.toThrow('只能取消待支付订单');
        });
    });

    describe('统计查询', () => {
        beforeEach(async () => {
            // 创建多个测试订单
            const orders = [
                {
                    orderId: Order.generateOrderId(),
                    userId: testUser._id,
                    items: [{
                        itemId: 'gems_100',
                        itemType: 'gems',
                        name: '100宝石',
                        quantity: 1,
                        unitPrice: 600,
                        totalPrice: 600
                    }],
                    subtotal: 600,
                    totalAmount: 600,
                    status: 'completed',
                    payment: {
                        status: 'paid',
                        method: 'alipay'
                    },
                    createdAt: new Date()
                },
                {
                    orderId: Order.generateOrderId(),
                    userId: testUser._id,
                    items: [{
                        itemId: 'gems_500',
                        itemType: 'gems',
                        name: '500宝石',
                        quantity: 1,
                        unitPrice: 2800,
                        totalPrice: 2800
                    }],
                    subtotal: 2800,
                    totalAmount: 2800,
                    status: 'completed',
                    payment: {
                        status: 'paid',
                        method: 'wechat'
                    },
                    createdAt: new Date()
                }
            ];
            
            await Order.insertMany(orders);
        });
        
        test('应该能查询用户订单历史', async () => {
            const orders = await Order.findByUser(testUser._id);
            
            expect(orders).toHaveLength(2);
            expect(orders[0].status).toBe('completed');
        });
        
        test('应该能统计收入', async () => {
            const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const endDate = new Date();
            
            const stats = await Order.getRevenueStats(startDate, endDate);
            
            expect(stats.length).toBeGreaterThan(0);
        });
        
        test('应该能查询热销商品', async () => {
            const topItems = await Order.getTopSellingItems(30, 10);
            
            expect(topItems.length).toBeGreaterThan(0);
            expect(topItems[0]).toHaveProperty('totalRevenue');
        });
    });
});
