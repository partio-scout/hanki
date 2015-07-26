CREATE TABLE acl
(
  model character varying(1024),
  property character varying(1024),
  accesstype character varying(1024),
  permission character varying(1024),
  principaltype character varying(1024),
  principalid character varying(1024),
  id serial NOT NULL,
  CONSTRAINT acl_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);

CREATE TABLE accesstoken
(
  id character varying(1024) NOT NULL,
  ttl integer,
  created timestamp with time zone,
  userid integer,
  CONSTRAINT accesstoken_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);

CREATE TABLE role
(
  id serial NOT NULL,
  name character varying(1024) NOT NULL,
  description character varying(1024),
  created timestamp with time zone,
  modified timestamp with time zone,
  CONSTRAINT role_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);

CREATE TABLE rolemapping
(
  id serial NOT NULL,
  principaltype character varying(1024),
  principalid character varying(1024),
  roleid integer,
  CONSTRAINT rolemapping_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);

CREATE TABLE "user"
(
  realm character varying(1024),
  username character varying(1024),
  password character varying(1024) NOT NULL,
  credentials character varying(1024),
  challenges character varying(1024),
  email character varying(1024) NOT NULL,
  emailverified boolean,
  verificationtoken character varying(1024),
  status character varying(1024),
  created timestamp with time zone,
  lastupdated timestamp with time zone,
  phone VARCHAR(255),
  enlistment VARCHAR(255),
  user_section VARCHAR(255),
  id serial NOT NULL,
  CONSTRAINT user_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);

  
CREATE TABLE public.title (
                title_id SERIAL NOT NULL,
                name VARCHAR(255) NOT NULL,
                titlegroup_id INTEGER NOT NULL,
				unit VARCHAR(255) NOT NULL,
				price_without_tax FLOAT8 NOT NULL,
				vat_percent FLOAT8 NOT NULL,
				price_with_tax FLOAT8 NOT NULL,
				account_id INTEGER NOT NULL,
				supplier_id INTEGER NOT NULL,
				supplier_titlecode VARCHAR(255) NOT NULL,
				to_resold BOOLEAN,
				to_rent BOOLEAN,
				to_bought BOOLEAN,
				to_signed_for BOOLEAN,
				memo TEXT,
				selectable BOOLEAN,
                CONSTRAINT title_pk PRIMARY KEY (title_id)
);

CREATE TABLE public.titlegroup (
                titlegroup_id SERIAL NOT NULL,
                name VARCHAR(255) NOT NULL,
				description VARCHAR(255),
                CONSTRAINT titlegroup_pk PRIMARY KEY (titlegroup_id)
);

CREATE TABLE public.account (
                account_id SERIAL NOT NULL,
                name VARCHAR(255) NOT NULL,
				description VARCHAR(255),
                CONSTRAINT account_pk PRIMARY KEY (account_id)
);

CREATE TABLE public.supplier (
                supplier_id SERIAL NOT NULL,
                name VARCHAR(255) NOT NULL,
				address VARCHAR(255) NOT NULL,
				contact_person VARCHAR(255) NOT NULL,
				phone VARCHAR(255) NOT NULL,
				email VARCHAR(255) NOT NULL,
				customer_number VARCHAR(255) NOT NULL,
				business_id VARCHAR(255) NOT NULL,
                terms_of_payment VARCHAR(255) NOT NULL,
				terms_of_delivery VARCHAR(255) NOT NULL,
				method_of_delivery VARCHAR(255) NOT NULL,
                CONSTRAINT supplier_pk PRIMARY KEY (supplier_id)
);

CREATE TABLE public.delivery (
                delivery_id serial NOT NULL,
				description VARCHAR(255) NOT NULL,
                earliest TIMESTAMP NOT NULL,
                latest TIMESTAMP NOT NULL,
				address VARCHAR(255) NOT NULL,
                CONSTRAINT delivery_pk PRIMARY KEY (delivery_id)
);

CREATE TABLE public.costcenter (
                costcenter_id SERIAL NOT NULL,
                name VARCHAR(255) NOT NULL,
                CONSTRAINT costcenter_pk PRIMARY KEY (costcenter_id)
);

CREATE TABLE public.usageobject (
                usageobject_id SERIAL NOT NULL,
                name VARCHAR(255) NOT NULL,
				master INTEGER,
				controller INTEGER,
				provider INTEGER,
                CONSTRAINT usageobject_pk PRIMARY KEY (usageobject_id)
);

CREATE TABLE public.purchaseorder (
                order_id SERIAL NOT NULL,
                name VARCHAR(255) NOT NULL,
				costcenter_id INTEGER NOT NULL,
				usageobject_id INTEGER NOT NULL,
				subscriber INTEGER NOT NULL,
                CONSTRAINT purchaseorder_pk PRIMARY KEY (order_id)
);

CREATE TABLE public.purchaseorderrow (
                order_row_id SERIAL NOT NULL,
				title_id INTEGER NOT NULL,
				amount INTEGER NOT NULL,
				delivery_id INTEGER NOT NULL,
				order_id INTEGER NOT NULL,
				self_supply BOOLEAN NOT NULL,
				memo TEXT,
				modified TIMESTAMP NOT NULL,
				finished BOOLEAN,
				user_section_approval BOOLEAN,
				controller_approval BOOLEAN,
				provider_approval BOOLEAN,
				approved BOOLEAN NOT NULL,
				ordered BOOLEAN,
				purchase_order_number INTEGER,
				confirmed BOOLEAN,
				delivered BOOLEAN,
                CONSTRAINT purchaseorderrow_pk PRIMARY KEY (order_row_id)
);

ALTER TABLE public.title ADD CONSTRAINT title_titlegroup_fk
FOREIGN KEY (titlegroup_id)
REFERENCES public.titlegroup (titlegroup_id)
ON DELETE NO ACTION
ON UPDATE NO ACTION
NOT DEFERRABLE;

ALTER TABLE public.title ADD CONSTRAINT title_account_fk
FOREIGN KEY (account_id)
REFERENCES public.account (account_id)
ON DELETE NO ACTION
ON UPDATE NO ACTION
NOT DEFERRABLE;

ALTER TABLE public.title ADD CONSTRAINT title_supplier_fk
FOREIGN KEY (supplier_id)
REFERENCES public.supplier (supplier_id)
ON DELETE NO ACTION
ON UPDATE NO ACTION
NOT DEFERRABLE;

ALTER TABLE public.usageobject ADD CONSTRAINT usageobject_user_master_fk
FOREIGN KEY (master)
REFERENCES public.user (id)
ON DELETE NO ACTION
ON UPDATE NO ACTION
NOT DEFERRABLE;

ALTER TABLE public.usageobject ADD CONSTRAINT usageobject_user_controller_fk
FOREIGN KEY (controller)
REFERENCES public.user (id)
ON DELETE NO ACTION
ON UPDATE NO ACTION
NOT DEFERRABLE;

ALTER TABLE public.usageobject ADD CONSTRAINT usageobject_user_provider_fk
FOREIGN KEY (provider)
REFERENCES public.user (id)
ON DELETE NO ACTION
ON UPDATE NO ACTION
NOT DEFERRABLE;

ALTER TABLE public.purchaseorder ADD CONSTRAINT purchaseorder_user_fk
FOREIGN KEY (subscriber)
REFERENCES public.user (id)
ON DELETE NO ACTION
ON UPDATE NO ACTION
NOT DEFERRABLE;

ALTER TABLE public.purchaseorder ADD CONSTRAINT purchaseorder_usageobject_fk
FOREIGN KEY (usageobject_id)
REFERENCES public.usageobject (usageobject_id)
ON DELETE NO ACTION
ON UPDATE NO ACTION
NOT DEFERRABLE;

ALTER TABLE public.purchaseorder ADD CONSTRAINT purchaseorder_costcenter_fk
FOREIGN KEY (costcenter_id)
REFERENCES public.costcenter (costcenter_id)
ON DELETE NO ACTION
ON UPDATE NO ACTION
NOT DEFERRABLE;

ALTER TABLE public.purchaseorderrow ADD CONSTRAINT purchaseorderrow_delivery_fk
FOREIGN KEY (delivery_id)
REFERENCES public.delivery (delivery_id)
ON DELETE NO ACTION
ON UPDATE NO ACTION
NOT DEFERRABLE;

ALTER TABLE public.purchaseorderrow ADD CONSTRAINT purchaseorderrow_purchaseorder_fk
FOREIGN KEY (order_id)
REFERENCES public.purchaseorder (order_id)
ON DELETE NO ACTION
ON UPDATE NO ACTION
NOT DEFERRABLE;

ALTER TABLE public.purchaseorderrow ADD CONSTRAINT purchaseorderrow_title_fk
FOREIGN KEY (title_id)
REFERENCES public.title (title_id)
ON DELETE NO ACTION
ON UPDATE NO ACTION
NOT DEFERRABLE;

ALTER SEQUENCE account_account_id_seq
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 1
  CACHE 1
  OWNED BY account.account_id;
  
ALTER SEQUENCE costcenter_costcenter_id_seq
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 1
  CACHE 1
  OWNED BY costcenter.costcenter_id;
  
ALTER SEQUENCE delivery_delivery_id_seq
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 1
  CACHE 1
  OWNED BY delivery.delivery_id;
  
ALTER SEQUENCE purchaseorder_order_id_seq
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 1
  CACHE 1
  OWNED BY purchaseorder.order_id;
  
ALTER SEQUENCE purchaseorderrow_order_row_id_seq
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 1
  CACHE 1
  OWNED BY purchaseorderrow.order_row_id;
  
ALTER SEQUENCE supplier_supplier_id_seq
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 1
  CACHE 1
  OWNED BY supplier.supplier_id;
  
ALTER SEQUENCE title_title_id_seq
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 1
  CACHE 1
  OWNED BY title.title_id;
  
ALTER SEQUENCE titlegroup_titlegroup_id_seq
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 1
  CACHE 1
  OWNED BY titlegroup.titlegroup_id;
  
ALTER SEQUENCE usageobject_usageobject_id_seq
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 1
  CACHE 1
  OWNED BY usageobject.usageobject_id;