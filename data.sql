INSERT INTO account (account_id,name,description) VALUES (1,'Testitili 1','Testitili 1: Tilinumero FIxxxyyyzzz');
INSERT INTO account (account_id,name,description) VALUES (2,'Testitili 2','Testitili 2: Tilinumero FIxxxyyyzzz');
INSERT INTO titlegroup (titlegroup_id,name,description) VALUES (1,'Rautatavara','Pultit ja mutterit');
INSERT INTO titlegroup (titlegroup_id,name,description) VALUES (2,'Puutavara','Laudat ja lankut');
INSERT INTO supplier (supplier_id,name,address,contact_person,phone,email,customer_number,business_id,terms_of_payment,terms_of_delivery,method_of_delivery) VALUES (1,'Tmi Toimittaja','Toimituskatu 1','Tero Toimittaja','123','tero@toimitta.ja','222','Y-222-222','Käteinen','Maksu ensin','Paikan päälle');
INSERT INTO delivery (delivery_id,description,earliest,latest,address) VALUES (1,'Tavaroitten toimitus','2015-08-25','2015-08-27','Evo');
INSERT INTO costcenter (costcenter_id,name) VALUES (1,'Roihun rahat');

/* Insert some titles */
INSERT INTO title (title_id,name,titlegroup_id,unit,price_without_tax,vat_percent,price_with_tax,account_id,supplier_id,supplier_titlecode) VALUES 
	(1,'Naulat 70mm', 1, 'Kg', 3.5, 22, 4,1,1,'supplier_titlecode HERE'),
	(2,'Naulat 30mm', 1, 'Kg', 3.5, 22, 4,1,1,'supplier_titlecode HERE'),
	(3,'Vaneri', 2, 'm', 3.5, 22, 4,1,1,'supplier_titlecode HERE'),
	(4,'2x4" raakapuu', 2, 'm', 3.5, 22, 4,1,1,'supplier_titlecode HERE');

/* Insert users 
	default password is 'salasana'
*/
INSERT INTO "user" VALUES (NULL, 'admin', '$2a$10$1rllCFIqdWhaGQM4sEnQEuUa0XSTyRjuzhXo39VEdyUDOVuc93cGC', NULL, NULL, 'admin@foo.fi', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO "user" VALUES (NULL, 'master', '$2a$10$1rllCFIqdWhaGQM4sEnQEuUa0XSTyRjuzhXo39VEdyUDOVuc93cGC', NULL, NULL, 'master@foo.fi', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2);
INSERT INTO "user" VALUES (NULL, 'controller', '$2a$10$1rllCFIqdWhaGQM4sEnQEuUa0XSTyRjuzhXo39VEdyUDOVuc93cGC', NULL, NULL, 'controller@foo.fi', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3);
INSERT INTO "user" VALUES (NULL, 'provider', '$2a$10$1rllCFIqdWhaGQM4sEnQEuUa0XSTyRjuzhXo39VEdyUDOVuc93cGC', NULL, NULL, 'provider@foo.fi', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 4);
INSERT INTO "user" VALUES (NULL, 'orderer', '$2a$10$1rllCFIqdWhaGQM4sEnQEuUa0XSTyRjuzhXo39VEdyUDOVuc93cGC', NULL, NULL, 'orderer@foo.fi', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 5);
INSERT INTO "user" VALUES (NULL, 'approver', '$2a$10$1rllCFIqdWhaGQM4sEnQEuUa0XSTyRjuzhXo39VEdyUDOVuc93cGC', NULL, NULL, 'approver@foo.fi', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 6);
INSERT INTO "user" VALUES (NULL, 'procurementAdmin', '$2a$10$1rllCFIqdWhaGQM4sEnQEuUa0XSTyRjuzhXo39VEdyUDOVuc93cGC', NULL, NULL, 'procurementAdmin@foo.fi', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 7);

/* Insert roles */
INSERT INTO role VALUES (1, 'admin', NULL, '2015-07-26 13:40:15+03', '2015-07-26 13:40:15+03');
INSERT INTO role VALUES (2, 'procurementMaster', NULL, '2015-07-26 13:40:14.994+03', '2015-07-26 13:40:14.994+03');
INSERT INTO role VALUES (3, 'controller', NULL, '2015-07-26 13:40:14.993+03', '2015-07-26 13:40:14.993+03');
INSERT INTO role VALUES (4, 'provider', NULL, '2015-07-26 13:40:15.023+03', '2015-07-26 13:40:15.023+03');
INSERT INTO role VALUES (5, 'orderer', NULL, '2015-07-26 13:40:15.023+03', '2015-07-26 13:40:15.023+03');
INSERT INTO role VALUES (6, 'approver', NULL, '2015-07-26 13:40:14.987+03', '2015-07-26 13:40:14.987+03');
INSERT INTO role VALUES (7, 'procurementAdmin', NULL, '2015-07-26 13:40:15.002+03', '2015-07-26 13:40:15.002+03');


/* Do rolemapping */
INSERT INTO rolemapping (principaltype, principalid, roleid) VALUES ('USER', '1', 1);
INSERT INTO rolemapping (principaltype, principalid, roleid) VALUES ('USER', '2', 2);
INSERT INTO rolemapping (principaltype, principalid, roleid) VALUES ('USER', '3', 3);
INSERT INTO rolemapping (principaltype, principalid, roleid) VALUES ('USER', '4', 4);
INSERT INTO rolemapping (principaltype, principalid, roleid) VALUES ('USER', '5', 5);
INSERT INTO rolemapping (principaltype, principalid, roleid) VALUES ('USER', '6', 6);
INSERT INTO rolemapping (principaltype, principalid, roleid) VALUES ('USER', '7', 7);


/* Insert usageobjects */
INSERT INTO usageobject (usageobject_id,name,master,controller,provider) VALUES (1,'Käyttökohde',2,3,4);

/* Insert purchase orders */
/* 1 - owned by controller */
INSERT INTO purchaseorder (usageobject_id,name,costcenter_id,subscriber) VALUES (1, 'Tornin materiaalit - controller', 1, 3);
/* 2 - owned by orderer */
INSERT INTO purchaseorder (usageobject_id,name,costcenter_id,subscriber) VALUES (1, 'Tanssilava - orderer', 1, 5);

/* Insert purchaseorderrows */
/* for order #2 (orderer) */
INSERT INTO purchaseorderrow (title_id, amount, delivery_id, order_id, self_supply, modified, approved) VALUES (1, 2, 1, 2, 'false', '2015-07-26 13:40:15.002+03', 'false');