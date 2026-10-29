require("dotenv").config();
const crypto = require("crypto");
const { AuditLog } = require("../../index/index.model");

function generateLogHash(traceId, action, actorEmail, timestamp) {
  return crypto
    .createHash("sha256")
    .update(`${traceId}:${action}:${actorEmail}:${timestamp}`)
    .digest("hex");
}

async function seedDatabaseAuditLogs() {
  try {
    await AuditLog.sync({ alter: true });
    const count = await AuditLog.count();

    if (count > 0) {
      console.log(`Database already has ${count} audit log records.`);
      process.exit(0);
    }

    const orgId = "FIQO000AAA";
    const now = Date.now();

    const realDatabaseRecords = [
      {
        traceId: "TRC-982101",
        action: "USER_AUTHENTICATION_SUCCESS",
        actionLabel: "Admin Portal Authentication",
        category: "auth_access",
        severity: "info",
        actorId: "UID-1",
        actorName: "John Doe",
        actorRole: "Company Admin",
        actorEmail: "john.doe@acmefleet.com",
        targetResource: "Admin Portal",
        targetId: "DASHBOARD",
        ipAddress: "103.21.144.92",
        locationCity: "Mumbai, IN",
        deviceInfo: "Chrome 122 / Windows 11",
        status: "success",
        details: {
          authMethod: "Password + 2FA TOTP",
          sessionTtlSeconds: 86400,
          protocol: "HTTPS / TLS 1.3",
        },
        organizationId: orgId,
        createdAt: new Date(now - 15 * 60 * 1000),
      },
      {
        traceId: "TRC-982102",
        action: "GEOFENCE_BREACH_DETECTED",
        actionLabel: "Urban Zone Speed Violation",
        category: "telematics_geofence",
        severity: "high",
        actorId: "UID-6",
        actorName: "Ravi Kumar",
        actorRole: "Fleet Driver",
        actorEmail: "ravi@example.com",
        targetResource: "Geofence Zone",
        targetId: "GEO-102",
        ipAddress: "49.36.128.45",
        locationCity: "Connaught Place, New Delhi",
        deviceInfo: "FleetIQ Driver Android v2.4",
        status: "flagged",
        details: {
          vehicleId: "ACMTR000AAA",
          vehicleNumber: "MH01AB1234",
          zoneName: "Connaught Place Strict Urban Zone",
          recordedSpeedKmH: 52,
          allowedSpeedKmH: 30,
        },
        organizationId: orgId,
        createdAt: new Date(now - 45 * 60 * 1000),
      },
      {
        traceId: "TRC-982103",
        action: "SUSPICIOUS_LOGIN_ATTEMPT_BLOCKED",
        actionLabel: "Brute Force IP Rate-Limiting",
        category: "security_threat",
        severity: "critical",
        actorId: "UNKNOWN",
        actorName: "External IP Intruder",
        actorRole: "Unauthenticated",
        actorEmail: "root@acmefleet.com",
        targetResource: "Auth API Endpoint",
        targetId: "/api/v1/auth/login",
        ipAddress: "185.220.101.5",
        locationCity: "Frankfurt, DE",
        deviceInfo: "Python-Requests / Headless Linux",
        status: "blocked",
        details: {
          failureCount: 5,
          defenseAction: "IP Rate-Limited for 60 minutes",
          wafRule: "WAF-RULE-BRUTE-FORCE-09",
        },
        organizationId: orgId,
        createdAt: new Date(now - 80 * 60 * 1000),
      },
      {
        traceId: "TRC-982104",
        action: "VEHICLE_ASSIGNED",
        actionLabel: "Commercial Vehicle Transit Assignment",
        category: "vehicle_operations",
        severity: "info",
        actorId: "UID-1",
        actorName: "John Doe",
        actorRole: "Company Admin",
        actorEmail: "john.doe@acmefleet.com",
        targetResource: "Vehicle Unit",
        targetId: "ACMBU000AAA",
        ipAddress: "103.21.144.92",
        locationCity: "Mumbai, IN",
        deviceInfo: "Chrome 122 / Windows 11",
        status: "success",
        details: {
          vehicleNumber: "WB03DE0000",
          vehicleName: "Volvo Bus",
          assignedDriverId: 8,
          assignedDriverName: "Pranjal Kundliya",
          route: "Mumbai Central to Pune Logistics Hub",
        },
        organizationId: orgId,
        createdAt: new Date(now - 120 * 60 * 1000),
      },
      {
        traceId: "TRC-982105",
        action: "DRIVER_DUTY_STATUS_UPDATED",
        actionLabel: "Driver Shift Check-In",
        category: "vehicle_operations",
        severity: "info",
        actorId: "UID-9",
        actorName: "Satyam Tomar",
        actorRole: "Fleet Driver",
        actorEmail: "satyam@gmail.com",
        targetResource: "Driver Shift",
        targetId: "SHIFT-DELHI-09",
        ipAddress: "49.36.192.12",
        locationCity: "Okhla, New Delhi",
        deviceInfo: "FleetIQ Driver Android v2.4",
        status: "success",
        details: {
          hubLocation: "Okhla Central Logistics Depot",
          vehicleAssigned: "ACMTR000AAA",
        },
        organizationId: orgId,
        createdAt: new Date(now - 180 * 60 * 1000),
      },
      {
        traceId: "TRC-982106",
        action: "TELEMETRY_EXPORT_AUDIT",
        actionLabel: "Bulk Compliance CSV Report Generated",
        category: "system_data",
        severity: "info",
        actorId: "UID-1",
        actorName: "John Doe",
        actorRole: "Company Admin",
        actorEmail: "john.doe@acmefleet.com",
        targetResource: "Reporting Subsystem",
        targetId: "EXPORT-CSV",
        ipAddress: "103.21.144.92",
        locationCity: "Mumbai, IN",
        deviceInfo: "Chrome 122 / Windows 11",
        status: "success",
        details: {
          scope: "Quarterly Vehicle & Trip Compliance Audit",
          recordsExported: 48,
        },
        organizationId: orgId,
        createdAt: new Date(now - 300 * 60 * 1000),
      },
    ];

    // Compute cryptographic SHA-256 for each real record and insert into MySQL
    for (const record of realDatabaseRecords) {
      record.hashSignature = generateLogHash(
        record.traceId,
        record.action,
        record.actorEmail,
        record.createdAt.toISOString()
      );
      await AuditLog.create(record);
    }

    console.log(`✅ Successfully seeded ${realDatabaseRecords.length} records into MySQL database table 'audit_logs'!`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed Error:", err);
    process.exit(1);
  }
}

seedDatabaseAuditLogs();
