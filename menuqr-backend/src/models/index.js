const User = require('./User');
const Restaurant = require('./Restaurant');
const RestaurantHoraire = require('./RestaurantHoraire');
const Subscription = require('./Subscription');
const AdminLog = require('./AdminLog');
const Menu = require('./Menu');
const Category = require('./Category');
const MenuItem = require('./MenuItem');
const SupplementGroup = require('./SupplementGroup');
const SupplementOption = require('./SupplementOption');
const MenuItemVariant = require('./MenuItemVariant');
const Room = require('./Room');
const Table = require('./Table');
const QRScan = require('./QRScan');
const CallWaiter = require('./CallWaiter');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const OrderItemSupplement = require('./OrderItemSupplement');
const OrderStatusLog = require('./OrderStatusLog');
const Reservation = require('./Reservation');
const ReservationSettings = require('./ReservationSettings');
const Payment = require('./Payment');
const ServiceClose = require('./ServiceClose');
const Plan = require('./Plan');
const Invoice = require('./Invoice');
const Notification = require('./Notification');
const NotificationSettings = require('./NotificationSettings');

// Restaurant ↔ User (owner)
Restaurant.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });
User.hasOne(Restaurant, { foreignKey: 'owner_id', as: 'ownedRestaurant' });

// Restaurant ↔ User (staff)
Restaurant.hasMany(User, { foreignKey: 'restaurant_id', as: 'staff' });
User.belongsTo(Restaurant, { foreignKey: 'restaurant_id', as: 'restaurant' });

// Restaurant ↔ RestaurantHoraire
Restaurant.hasMany(RestaurantHoraire, { foreignKey: 'restaurant_id', as: 'horaires' });
RestaurantHoraire.belongsTo(Restaurant, { foreignKey: 'restaurant_id' });

// Restaurant ↔ Subscription (1:1)
Restaurant.hasOne(Subscription, { foreignKey: 'restaurant_id', as: 'subscription' });
Subscription.belongsTo(Restaurant, { foreignKey: 'restaurant_id', as: 'restaurant' });

// AdminLog ↔ User
AdminLog.belongsTo(User, { foreignKey: 'admin_id', as: 'admin' });

// Restaurant ↔ Menu
Restaurant.hasMany(Menu, { foreignKey: 'restaurant_id', as: 'menus' });
Menu.belongsTo(Restaurant, { foreignKey: 'restaurant_id' });

// Menu ↔ Category
Menu.hasMany(Category, { foreignKey: 'menu_id', as: 'categories', onDelete: 'CASCADE' });
Category.belongsTo(Menu, { foreignKey: 'menu_id', as: 'menu' });

// Category ↔ MenuItem
Category.hasMany(MenuItem, { foreignKey: 'category_id', as: 'items', onDelete: 'CASCADE' });
MenuItem.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// MenuItem ↔ SupplementGroup
MenuItem.hasMany(SupplementGroup, { foreignKey: 'menu_item_id', as: 'supplementGroups', onDelete: 'CASCADE' });
SupplementGroup.belongsTo(MenuItem, { foreignKey: 'menu_item_id' });

// MenuItem ↔ MenuItemVariant
MenuItem.hasMany(MenuItemVariant, { foreignKey: 'menu_item_id', as: 'variants', onDelete: 'CASCADE' });
MenuItemVariant.belongsTo(MenuItem, { foreignKey: 'menu_item_id' });

// SupplementGroup ↔ SupplementOption
SupplementGroup.hasMany(SupplementOption, { foreignKey: 'group_id', as: 'options', onDelete: 'CASCADE' });
SupplementOption.belongsTo(SupplementGroup, { foreignKey: 'group_id' });

// Restaurant ↔ Room
Restaurant.hasMany(Room, { foreignKey: 'restaurant_id', as: 'rooms', onDelete: 'CASCADE' });
Room.belongsTo(Restaurant, { foreignKey: 'restaurant_id' });

// Room ↔ Table
Room.hasMany(Table, { foreignKey: 'room_id', as: 'tables' });
Table.belongsTo(Room, { foreignKey: 'room_id', as: 'room' });

// Restaurant ↔ Table
Restaurant.hasMany(Table, { foreignKey: 'restaurant_id', as: 'tables' });
Table.belongsTo(Restaurant, { foreignKey: 'restaurant_id' });

// Table ↔ QRScan
Table.hasMany(QRScan, { foreignKey: 'table_id', as: 'scans' });
QRScan.belongsTo(Table, { foreignKey: 'table_id' });

// Table ↔ CallWaiter
Table.hasMany(CallWaiter, { foreignKey: 'table_id', as: 'callWaiters' });
CallWaiter.belongsTo(Table, { foreignKey: 'table_id', as: 'table' });

// Restaurant ↔ Order
Restaurant.hasMany(Order, { foreignKey: 'restaurant_id', as: 'orders' });
Order.belongsTo(Restaurant, { foreignKey: 'restaurant_id' });

// Table ↔ Order
Table.hasMany(Order, { foreignKey: 'table_id', as: 'orders' });
Order.belongsTo(Table, { foreignKey: 'table_id', as: 'table' });

// Order ↔ OrderItem
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

// MenuItem ↔ OrderItem
MenuItem.hasMany(OrderItem, { foreignKey: 'menu_item_id' });
OrderItem.belongsTo(MenuItem, { foreignKey: 'menu_item_id', as: 'menuItem' });

// OrderItem ↔ OrderItemSupplement
OrderItem.hasMany(OrderItemSupplement, { foreignKey: 'order_item_id', as: 'supplements', onDelete: 'CASCADE' });
OrderItemSupplement.belongsTo(OrderItem, { foreignKey: 'order_item_id' });

// Order ↔ OrderStatusLog
Order.hasMany(OrderStatusLog, { foreignKey: 'order_id', as: 'statusLogs', onDelete: 'CASCADE' });
OrderStatusLog.belongsTo(Order, { foreignKey: 'order_id' });

// User ↔ OrderStatusLog (who changed)
User.hasMany(OrderStatusLog, { foreignKey: 'changed_by', as: 'statusChanges' });
OrderStatusLog.belongsTo(User, { foreignKey: 'changed_by', as: 'changedBy' });

// Restaurant ↔ Reservation
Restaurant.hasMany(Reservation, { foreignKey: 'restaurant_id', as: 'reservations' });
Reservation.belongsTo(Restaurant, { foreignKey: 'restaurant_id' });

// Table ↔ Reservation
Table.hasMany(Reservation, { foreignKey: 'table_id', as: 'reservations' });
Reservation.belongsTo(Table, { foreignKey: 'table_id', as: 'table' });

// Restaurant ↔ ReservationSettings (1:1)
Restaurant.hasOne(ReservationSettings, { foreignKey: 'restaurant_id', as: 'reservationSettings' });
ReservationSettings.belongsTo(Restaurant, { foreignKey: 'restaurant_id' });

// Order ↔ User (staff who created the order)
User.hasMany(Order, { foreignKey: 'staff_id', as: 'handledOrders' });
Order.belongsTo(User, { foreignKey: 'staff_id', as: 'staff' });

// Order ↔ Payment (1:1)
Order.hasOne(Payment, { foreignKey: 'order_id', as: 'payment' });
Payment.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// User ↔ Payment (processed by)
User.hasMany(Payment, { foreignKey: 'processed_by', as: 'processedPayments' });
Payment.belongsTo(User, { foreignKey: 'processed_by', as: 'processedBy' });

// Restaurant ↔ ServiceClose
Restaurant.hasMany(ServiceClose, { foreignKey: 'restaurant_id', as: 'serviceCloses' });
ServiceClose.belongsTo(Restaurant, { foreignKey: 'restaurant_id' });

// User ↔ ServiceClose (closed by)
User.hasMany(ServiceClose, { foreignKey: 'closed_by', as: 'serviceCloses' });
ServiceClose.belongsTo(User, { foreignKey: 'closed_by', as: 'closedBy' });

// Restaurant ↔ Invoice
Restaurant.hasMany(Invoice, { foreignKey: 'restaurant_id', as: 'invoices' });
Invoice.belongsTo(Restaurant, { foreignKey: 'restaurant_id' });

// Subscription ↔ Invoice
Subscription.hasMany(Invoice, { foreignKey: 'subscription_id', as: 'invoices' });
Invoice.belongsTo(Subscription, { foreignKey: 'subscription_id', as: 'subscription' });

// Restaurant ↔ Notification
Restaurant.hasMany(Notification, { foreignKey: 'restaurant_id', as: 'notifications', onDelete: 'CASCADE' });
Notification.belongsTo(Restaurant, { foreignKey: 'restaurant_id' });

// Restaurant ↔ NotificationSettings (1:1)
Restaurant.hasOne(NotificationSettings, { foreignKey: 'restaurant_id', as: 'notificationSettings' });
NotificationSettings.belongsTo(Restaurant, { foreignKey: 'restaurant_id' });

module.exports = {
  User, Restaurant, RestaurantHoraire, Subscription, AdminLog,
  Menu, Category, MenuItem, SupplementGroup, SupplementOption, MenuItemVariant,
  Room, Table, QRScan, CallWaiter,
  Order, OrderItem, OrderItemSupplement, OrderStatusLog,
  Reservation, ReservationSettings,
  Payment, ServiceClose,
  Plan, Invoice,
  Notification, NotificationSettings,
};
