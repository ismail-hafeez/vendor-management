
-- Create Database
CREATE DATABASE vendor_database;

-- Use Database
USE vendor_database;

-- Table: Department
CREATE TABLE Department (
    DepartmentID INT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    BudgetStatus VARCHAR(50) NOT NULL
);

-- Table: Budget
CREATE TABLE Budget (
    DepartmentID INT PRIMARY KEY,
    AllocatedAmount DECIMAL(10, 2) NOT NULL,
    Spent DECIMAL(10, 2) NOT NULL,
    RemainingAmount DECIMAL(10, 2) GENERATED ALWAYS AS (AllocatedAmount - Spent) VIRTUAL,
    FOREIGN KEY (DepartmentID) REFERENCES Department(DepartmentID) 
        ON DELETE CASCADE
);

-- Table: User
CREATE TABLE User (
    UserID INT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    phoneNumber VARCHAR(15) NOT NULL, 
    Password VARCHAR(100) NOT NULL,
    Role ENUM('Head', 'Manager', 'Team Member') NOT NULL,
    DepartmentID INT,
    FOREIGN KEY (DepartmentID) REFERENCES Department(DepartmentID) 
        ON DELETE SET NULL
);

-- Table: Notification
CREATE TABLE Notification (
    NotificationID INT PRIMARY KEY,
    Message TEXT NOT NULL,
    Date DATE NOT NULL,
    UserID INT,
    FOREIGN KEY (UserID) REFERENCES User(UserID)
        ON DELETE CASCADE
);

-- Table: Vendor
CREATE TABLE Vendor (
    VendorID INT PRIMARY KEY,
    Email VARCHAR(100) UNIQUE NOT NULL,
    phoneNumber VARCHAR(15) NOT NULL, 
    Password VARCHAR(100) NOT NULL,
    ServiceCategory VARCHAR(100) NOT NULL
);

-- Table: VendorManagement
CREATE TABLE VendorManagement (
    VendorID INT PRIMARY KEY,
    PerformanceRating DECIMAL(3, 2),
    DeliveryTime INT, -- Assuming this is in days
    FeedbackText TEXT,
    FOREIGN KEY (VendorID) REFERENCES Vendor(VendorID)
        ON DELETE CASCADE
);

-- Table: Contract
CREATE TABLE Contract (
    ContractID INT PRIMARY KEY,
    TermsAndConditions TEXT NOT NULL,
    ExpirationDate DATE NOT NULL,
    SpecialClauses TEXT,
    VendorID INT,
    FOREIGN KEY (VendorID) REFERENCES Vendor(VendorID)
        ON DELETE CASCADE
);

-- Table: PurchaseOrder
CREATE TABLE PurchaseOrder (
    PurchaseOrderID INT PRIMARY KEY,
    Date DATE NOT NULL,
    Quantity INT NOT NULL,
    TotalAmount DECIMAL(10, 2),
    Description TEXT,
    Status VARCHAR(50),
    DepartmentID INT,
    FOREIGN KEY (DepartmentID) REFERENCES Department(DepartmentID)
        ON DELETE CASCADE,
    VendorID INT,
    FOREIGN KEY (VendorID) REFERENCES Vendor(VendorID)
        ON DELETE CASCADE
);

-- Table: Item
CREATE TABLE Item (
    ItemID INT PRIMARY KEY,
    ItemName VARCHAR(100) NOT NULL,
    UnitPrice DECIMAL(10, 2) NOT NULL
);

-- Table: PurchaseOrderItem (Association Table for Purchase Orders and Items)
CREATE TABLE PurchaseOrderItem (
    PurchaseOrderID INT,
    ItemID INT,
    FOREIGN KEY (PurchaseOrderID) REFERENCES PurchaseOrder(PurchaseOrderID)
        ON DELETE CASCADE,
    FOREIGN KEY (ItemID) REFERENCES Item(ItemID)
        ON DELETE CASCADE,
    PRIMARY KEY (PurchaseOrderID, ItemID)
);

-- Table: DepartmentContract
CREATE TABLE DepartmentContract (
    DepartmentID INT,
    ContractID INT,
    FOREIGN KEY (DepartmentID) REFERENCES Department(DepartmentID)
        ON DELETE CASCADE,
    FOREIGN KEY (ContractID) REFERENCES Contract(ContractID)
        ON DELETE CASCADE,
    PRIMARY KEY (DepartmentID, ContractID)
);

DELIMITER $$

CREATE TRIGGER check_department_budget
BEFORE INSERT ON purchaseorder
FOR EACH ROW
BEGIN
    DECLARE remaining_budget DECIMAL(10, 2);

    -- Fetch the remaining budget for the department
    SELECT RemainingAmount INTO remaining_budget
    FROM budget
    WHERE DepartmentID = NEW.DepartmentID;

    -- Check if the remaining budget is sufficient
    IF remaining_budget < NEW.TotalAmount THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Insufficient budget for this department. Cannot proceed with the purchase order.';
    ELSE
        -- Update the Spent column in the budget table
        UPDATE budget
        SET Spent = Spent + NEW.TotalAmount
        WHERE DepartmentID = NEW.DepartmentID;
    END IF;
END$$

DELIMITER ;
