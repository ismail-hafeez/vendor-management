DELIMITER $$

CREATE TRIGGER check_contract_expiration
BEFORE INSERT ON Contract
FOR EACH ROW
BEGIN
    DECLARE current_date DATE;
    SET current_date = CURDATE(); -- Get the current date

    -- Check if ExpirationDate is less than 30 days from the current date
    IF DATEDIFF(NEW.ExpirationDate, current_date) < 30 THEN
        -- Generate a message (This can be logged into a message table, or printed as an error, etc.)
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Warning: Contract expiration is within 30 days.';
    END IF;
END $$

DELIMITER ;

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

use vendor_database;

DELIMITER //

CREATE PROCEDURE registerVendor(
	IN vendor_ID INT,
    IN vendorEmail VARCHAR(100),
    IN vendorPhone VARCHAR(15),
    IN vendorPassword VARCHAR(100),
    IN vendorServiceCategory VARCHAR(100)
)
BEGIN
    INSERT INTO Vendor (vendorID, email, phoneNumber, password, serviceCategory)
    VALUES (vendor_ID, vendorEmail, vendorPhone, vendorPassword, vendorServiceCategory);
END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE registerUser(
    IN userID INT,
    IN userName VARCHAR(100),
    IN userEmail VARCHAR(100),
    IN userPhone VARCHAR(15),
    IN userPassword VARCHAR(100),
    IN userRole ENUM('Head', 'Manager', 'Team Member'),
    IN userDepartmentID INT
)
BEGIN
    INSERT INTO User (userID, name, email, phoneNumber, password, role, DepartmentID)
    VALUES (userID, userName, userEmail, userPhone, userPassword, userRole, userDepartmentID);
END //

DELIMITER ;




