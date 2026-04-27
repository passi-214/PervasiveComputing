#include <database/mariadb/MariaDBClient.h>
#include <mysql.h>
#include <express/legacy/in/WebApp.h>
#include <nlohmann/json.hpp>
#include "dotenv.h"
#include <string>

int main(int argc, char* argv[]) {
    express::WebApp::init(argc, argv);
    using App = express::legacy::in::WebApp;
    App app;
    loadDotEnv();

    const database::mariadb::MariaDBConnectionDetails dbDetails = {
        .connectionName = "db",
        .hostname = "localhost",
        .username = getEnvOr("DB_USER", "root"),
        .password = getEnvOr("DB_PASSWORD", ""),
        .database = getEnvOr("DB_NAME", "snodec"),
	.port = static_cast<unsigned int>(std::stoul(getEnvOr("DB_PORT", "3306"))),
        .socket = "/run/mysqld/mysqld.sock",
        .flags = 0,
    };

    static database::mariadb::MariaDBClient db(dbDetails, [](const auto& state) {
        if (state.connected) VLOG(0) << "DB connected";
    });

    app.get("/api/ping", [] APPLICATION(req, res) {
        res->send("{\"ok\":true}");
    });

    app.get("/api/measurements/latest", [] APPLICATION(req, res) {
        auto rows = std::make_shared<nlohmann::json>(nlohmann::json::array());

        db.query(
            "SELECT device_id, ts, lat, lon, temp_c, tds_ppm, turb_ntu "
            "FROM measurements "
            "ORDER BY ts DESC "
            "LIMIT 5",
            [rows, res](const MYSQL_ROW row) {
                if (row != nullptr) {
                    nlohmann::json item;
                    item["device_id"] = row[0] ? row[0] : "";
                    item["ts"]        = row[1] ? row[1] : "";
                    item["lat"]       = row[2] ? std::atof(row[2]) : 0.0;
                    item["lon"]       = row[3] ? std::atof(row[3]) : 0.0;
                    item["temp_c"]    = row[4] ? std::atof(row[4]) : 0.0;
                    item["tds_ppm"]   = row[5] ? std::atof(row[5]) : 0.0;
                    item["turb_ntu"]  = row[6] ? std::atof(row[6]) : 0.0;
                    rows->push_back(item);
                } else {
                    res->set("Content-Type", "application/json");
                    res->send(rows->dump());
                }
            },
            [res](const std::string& err, unsigned int no) {
                nlohmann::json out;
                out["ok"] = false;
                out["error"] = err;
                out["code"] = no;
                res->status(500);
                res->set("Content-Type", "application/json");
                res->send(out.dump());
            }
        );
    });

    app.listen(8080, [](const App::SocketAddress&, const core::socket::State&) {});
    return express::WebApp::start();
}
