"""
CoastGuard — SQLAlchemy Models

Tables:
  customers     — SMB business accounts (linked to Clerk auth)
  suppliers     — each customer's import suppliers
  products      — products tracked per customer (with HS code)
  import_orders — pending/in-transit orders
  tariff_alerts — AI-generated risk alerts per customer
"""

from datetime import datetime
from typing import Optional
from sqlalchemy import (
    Boolean, Column, DateTime, Float, ForeignKey,
    Integer, String, Text
)
from sqlalchemy.orm import relationship
from database import Base


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    clerk_id = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    company_name = Column(String(255), nullable=True)
    industry = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    suppliers = relationship("Supplier", back_populates="customer")
    products = relationship("Product", back_populates="customer")
    orders = relationship("ImportOrder", back_populates="customer")
    alerts = relationship("TariffAlert", back_populates="customer")


class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    country = Column(String(100), nullable=False)
    product_category = Column(String(255), nullable=True)
    contact_email = Column(String(255), nullable=True)
    reliability_score = Column(Float, default=50.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    customer = relationship("Customer", back_populates="suppliers")
    orders = relationship("ImportOrder", back_populates="supplier")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, autoincrement=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False, index=True)
    hs_code = Column(String(20), nullable=False)
    description = Column(String(500), nullable=True)
    unit_value_usd = Column(Float, nullable=True)
    import_country = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    customer = relationship("Customer", back_populates="products")
    orders = relationship("ImportOrder", back_populates="product")


class ImportOrder(Base):
    __tablename__ = "import_orders"

    id = Column(Integer, primary_key=True, autoincrement=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    order_value_usd = Column(Float, nullable=False)
    quantity = Column(Integer, default=1)
    expected_delivery_date = Column(DateTime, nullable=True)
    # status: pending | in_transit | delayed | cancelled | delivered
    status = Column(String(50), default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)

    customer = relationship("Customer", back_populates="orders")
    supplier = relationship("Supplier", back_populates="orders")
    product = relationship("Product", back_populates="orders")
    alerts = relationship("TariffAlert", back_populates="order")


class TariffAlert(Base):
    __tablename__ = "tariff_alerts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False, index=True)
    order_id = Column(Integer, ForeignKey("import_orders.id"), nullable=True)
    # alert_type: tariff_change | port_disruption | geopolitical | shipping_delay
    alert_type = Column(String(100), nullable=False)
    # severity: low | medium | high | critical
    severity = Column(String(50), nullable=False)
    summary = Column(Text, nullable=True)
    agent_output = Column(Text, nullable=True)   # JSON string from the 5-agent pipeline
    data_source = Column(String(100), nullable=True)
    # status: active | dismissed | resolved
    status = Column(String(50), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    customer = relationship("Customer", back_populates="alerts")
    order = relationship("ImportOrder", back_populates="alerts")
