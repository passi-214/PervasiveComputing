#include "dotenv.h"

#include <cstdlib>
#include <fstream>
#include <iostream>
#include <string>

void loadDotEnv(const std::string& path) {
    std::ifstream file(path);
    if (!file.is_open()) {
        std::cerr << "No .env file found at " << path << std::endl;
        return;
    }

    std::string line;
    while (std::getline(file, line)) {
        if (line.empty() || line[0] == '#') {
            continue;
        }

        const std::size_t pos = line.find('=');
        if (pos == std::string::npos) {
            continue;
        }

        const std::string key = line.substr(0, pos);
        const std::string value = line.substr(pos + 1);

        if (!key.empty()) {
            setenv(key.c_str(), value.c_str(), 1);
        }
    }
}

std::string getEnvOr(const char* name, const std::string& fallback) {
    const char* value = std::getenv(name);
    return value ? std::string(value) : fallback;
}
