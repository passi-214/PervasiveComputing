# Certificate Inventory

This inventory documents the local certificates used for MQTT TLS. Private keys and real certificate contents are not stored in this repository.

## MQTT Local CA

| Item | Value |
| --- | --- |
| File name | `ca.crt` |
| Certificate | `/etc/ssl/mqttsuite/ca.crt` |
| Private key | `/etc/ssl/mqttsuite/ca.key` |
| Type | Self-signed local CA |
| Purpose | Signs the local MQTT broker certificate |
| Issuer | `CN=PervasiveComputing MQTT Local CA` |
| Subject | `CN=PervasiveComputing MQTT Local CA` |
| Expiry | Created with `-days 3650`; verify exact `notAfter` with the command below |
| Trusted by | `mqttcli`; system trust store for `mqttbridge` |
| Rotation | Replace the CA and reissue the broker certificate |

## MQTT Broker Certificate

| Item | Value |
| --- | --- |
| File name | `broker.crt` |
| Certificate | `/etc/ssl/mqttsuite/broker.crt` |
| Private key | `/etc/ssl/mqttsuite/broker.key` |
| CSR | `/etc/ssl/mqttsuite/broker.csr` |
| Issuer | `CN=PervasiveComputing MQTT Local CA` |
| Subject | `CN=localhost` |
| Expiry | Created with `-days 825`; verify exact `notAfter` with the command below |
| SAN | `DNS:localhost`, `IP:127.0.0.1`, `IP:::1` |
| Used by | `mqttbroker in-mqtts` |
| Port | `127.0.0.1:8883` |
| Purpose | Encrypts local MQTT broker traffic |
| Clients | `mqttbridge`, `mqttcli` |
| Mutual TLS | No client certificates required |

## Trust Chain

```text
PervasiveComputing MQTT Local CA
  -> localhost MQTT broker certificate
```

## Verification Commands

Show broker certificate identity and SAN entries:

```zsh
openssl x509 -in /etc/ssl/mqttsuite/broker.crt \
  -noout -subject -issuer -enddate -ext subjectAltName
```

Show CA certificate identity and expiry:

```zsh
openssl x509 -in /etc/ssl/mqttsuite/ca.crt \
  -noout -subject -issuer -enddate
```

Verify the broker TLS handshake:

```zsh
openssl s_client -connect 127.0.0.1:8883 \
  -CAfile /etc/ssl/mqttsuite/ca.crt \
  -verify_return_error
```

Confirm the broker listens on the TLS port:

```zsh
ss -ltnp | grep ':8883'
```

Confirm the runtime bridge config uses TLS:

```zsh
grep -A12 -B2 '"instance_name": "local-mqtt"' mqtt/.runtime/ttn-bridge.json
```

Expected values:

```json
"encryption": "tls"
"port": 8883
```

## Security Notes

- Private keys must not be committed to the repository.
- `/etc/ssl/mqttsuite/broker.key` must be readable by the service user running `mqttbroker`.
- `/etc/ssl/mqttsuite/ca.key` should remain root-only and is only needed when issuing certificates.
- The current setup uses server-auth TLS, not mutual TLS.
- If the TTN API key appears in logs or screenshots, rotate it in The Things Network.
