// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "Campanadas",
    platforms: [
        .macOS(.v14),
        .iOS(.v17),
    ],
    products: [
        .library(name: "CampanadasCore", targets: ["CampanadasCore"]),
        .library(name: "CampanadasUI", targets: ["CampanadasUI"]),
        .executable(name: "Campanadas", targets: ["Campanadas"]),
    ],
    targets: [
        .target(name: "CampanadasCore"),
        .target(
            name: "CampanadasUI",
            dependencies: ["CampanadasCore"],
            resources: [.process("Resources")]
        ),
        .executableTarget(
            name: "Campanadas",
            dependencies: ["CampanadasUI"]
        ),
        .testTarget(
            name: "CampanadasCoreTests",
            dependencies: ["CampanadasCore"],
            path: "tests/CampanadasCoreTests"
        ),
        .testTarget(
            name: "CampanadasUITests",
            dependencies: ["CampanadasUI"],
            path: "tests/CampanadasUITests"
        ),
    ]
)
