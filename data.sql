INSERT INTO account (account_id,name,description) VALUES (1,'Testitili 1','Testitili 1: Tilinumero FIxxxyyyzzz');
INSERT INTO account (account_id,name,description) VALUES (2,'Testitili 2','Testitili 2: Tilinumero FIxxxyyyzzz');
INSERT INTO titlegroup (titlegroup_id,name,description) VALUES (1,'Rautatavara','Pultit ja mutterit');
INSERT INTO titlegroup (titlegroup_id,name,description) VALUES (2,'Puutavara','Laudat ja lankut');
INSERT INTO supplier (supplier_id,name,address,contact_person,phone,email,customer_number,business_id,terms_of_payment,terms_of_delivery,method_of_delivery) VALUES (1,'Tmi Toimittaja','Toimituskatu 1','Tero Toimittaja','123','tero@toimitta.ja','222','Y-222-222','Käteinen','Maksu ensin','Paikan päälle');
INSERT INTO delivery (delivery_id,description,earliest,latest,address) VALUES (1,'Tavaroitten toimitus','2015-08-25','2015-08-27','Evo');
INSERT INTO costcenter (costcenter_id,name) VALUES (1,'Roihun rahat');
INSERT INTO purchaseuser (user_id,name,phone,email,enlistment,user_section) VALUES (1,'Teuvo Tilaaja','123','teuvo@tilaa.ja','Ostaja','Palvelut');
INSERT INTO purchaseuser (user_id,name,phone,email,enlistment,user_section) VALUES (2,'Pekka Päällikkö','123','pekka@paallik.ko','Päällikkö','Palvelut');
INSERT INTO purchaseuser (user_id,name,phone,email,enlistment,user_section) VALUES (3,'Kaisa Controller','123','kaisa@controll.er','Controller','Palvelut');
INSERT INTO purchaseuser (user_id,name,phone,email,enlistment,user_section) VALUES (4,'Heidi Hankkija','123','heidi@hankki.ja','Hankkija','Palvelut');
INSERT INTO usageobject (usageobject_id,name,master,controller,provider) VALUES (1,'Leiriostot',2,3,4);
INSERT INTO purchaseorder (order_id,name,costcenter_id,usageobject_id,subscriber) VALUES (1,'Leirin tavarat',1,1,1);

/* Insert some titles */
INSERT INTO title (title_id,name,titlegroup_id,unit,price_without_tax,vat_percent,price_with_tax,account_id,supplier_id,supplier_titlecode) VALUES 
	(1,'Naulat 70mm', 1, 'Kg', 3.5, 22, 4,1,1,'supplier_titlecode HERE'),
	(2,'Naulat 30mm', 1, 'Kg', 3.5, 22, 4,1,1,'supplier_titlecode HERE'),
	(3,'Vaneri', 2, 'm', 3.5, 22, 4,1,1,'supplier_titlecode HERE'),
	(4,'2x4" raakapuu', 2, 'm', 3.5, 22, 4,1,1,'supplier_titlecode HERE');

/* Insert some rows to order */
INSERT INTO purchaseorderrow (order_row_id,title_id,amount,delivery_id,order_id,self_supply,modified,approved) VALUES 
	(1, 1, 30, 1, 1, FALSE, localtimestamp, TRUE),
	(2, 2, 30, 1, 1, FALSE, localtimestamp, TRUE),
	(3, 3, 30, 1, 1, FALSE, localtimestamp, TRUE),
	(4, 4, 30, 1, 1, FALSE, localtimestamp, TRUE);