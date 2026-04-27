cmake_minimum_required(VERSION 3.16)
project(backend_db LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(snodec REQUIRED COMPONENTS
    http-server-express-legacy-in
    db-mariadb
)

add_executable(backend_db
    src/main.cpp
    src/dotenv.cpp
)

target_link_libraries(backend_db PRIVATE
    snodec::http-server-express-legacy-in
    snodec::db-mariadb
)
