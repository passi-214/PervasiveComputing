#ifndef DOTENV_H
#define DOTENV_H

#include <string>

void loadDotEnv(const std::string& path = ".env");
std::string getEnvOr(const char* name, const std::string& fallback = "");

#endif
