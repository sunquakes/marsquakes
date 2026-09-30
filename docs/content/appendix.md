---
id: appendix
title: Server and Domain Setup
---

# Appendix: Buying a Server and a Domain

The deployment pages assume two things already exist: a cloud server that is
always on and reachable from the internet, and a domain that points to that
server. If you have neither, this appendix covers both, in the order that makes
every later step obvious:

1. Rent the server.
2. Give it a permanent address and open only the doors the website needs.
3. Find the server's **public IP** — the number the domain will point at.
4. Register a domain.
5. Hand DNS to one provider and add the record using that IP.
6. Confirm the name really points at the server.
7. Deploy the system and confirm it opens over the name.
8. Get the **padlock**: a certificate that makes the address start with
   `https://`.

Everything here is clicking through a website and pasting a sentence to your
agent — there is nothing to install and no code to write. The examples use AWS:
**Lightsail** for the server and **Route 53** for the domain and DNS.

## 1. Rent a server

A cloud server is simply another computer that stays on and has a public
address. The whole system runs in containers, so pick a server that already has
the container software (Docker) on it — nothing has to be set up afterwards.

**Rent one on AWS Lightsail:**

1. Open the Lightsail product page and sign in:
   [aws.amazon.com/lightsail](https://aws.amazon.com/lightsail/)
2. In the [Lightsail console](https://lightsail.aws.amazon.com/), choose
   **Create instance**.
3. Pick the AWS Region nearest the people using the system, and choose the
   **Linux/Unix** platform.
4. For the image choose **Apps + OS** (not **OS Only**) and select the
   **Docker** blueprint. It starts with Docker already installed.
5. Choose a plan with at least 2 GB of memory, give the instance a name, and
   choose **Create instance**.
6. Wait until the instance state is **Running**.

Detailed screenshots for every step are in the official guide:
[Create a Linux/Unix instance in Lightsail](https://docs.aws.amazon.com/lightsail/latest/userguide/getting-started-with-amazon-lightsail.html),
and the Docker blueprint is described in
[Docker in Lightsail](https://docs.aws.amazon.com/lightsail/latest/userguide/docker-in-lightsail.html).

## 2. Give it a permanent address

A plain Lightsail address changes every time the server is stopped and started
again, which would silently break the domain a day later. On the instance's
**Networking** tab, create a **static IP** and attach it. It is free while
attached to a running server. Treat this static IP as the server's permanent
address from now on.

## 3. Open only the doors the website needs

On the same **Networking** tab, the firewall lists the traffic allowed to reach
the server. Make sure only these are open:

| Label in the firewall | Port | Why it is open |
| --------------------- | ---- | -------------- |
| HTTP | 80 | the first test over the IP, and later HTTPS setup |
| HTTPS | 443 | open it when you add the padlock |

Make sure 3306, 6379 and 8817 are **not** open. Those belong to the data store,
the cache and the behind-the-scenes service — they are reached through the
website's door, and opening them directly would put the data on the open
internet.

## 4. Get the server's public IP

The domain record in step 6 needs the **public IP** — the one the whole internet
sees. Read it straight from the Lightsail page: it is shown next to the server
under **Public IP**, or open the static IP you attached. Copy it somewhere; you
will paste it verbatim.

:::caution Only the address from the Lightsail page
Servers also have an *internal* address, often starting with `172.` or `10.`,
that only other computers inside AWS can use. You do not see it on the Lightsail
page and you should not use it — a domain pointing at it fails from every device
outside. Copy only the public IP shown in the console.
:::

To be certain the server is ready and the address is right, give your agent the
address and its login details and ask:

> **Say this**
>
> I rented an AWS Lightsail server created from the Docker image, and attached
> a static IP. Its public address and login details are: [fill them in]. Log in
> and confirm the server is ready for this project, and tell me the public IP
> address it reports to the outside world. Do not change anything yet.

**What you should see:** the agent confirming the server is ready and quoting a
public IP that matches the one on the Lightsail page. If the two do not match,
or it cannot log in, say: "The IP you report does not match the one in my
console — check the static IP and my login details and tell me which is wrong."

## 5. Register a domain

A domain is just a name that is easier to remember than the IP. Owning it and
managing its DNS are two separate choices.

**Register one with Route 53:**

1. Open the [Route 53 console](https://console.aws.amazon.com/route53/) and go
   to **Registered domains**.
2. Choose **Register domains**, search for the name you want, and pick an
   ending (`.com`, `.net`, and so on).
3. Fill in the contact details and complete the payment.

A domain registered with Route 53 gets its hosted zone automatically, so you can
go straight to step 6. You may instead buy a domain from any other seller — only
the first part of step 6 changes.

## 6. Point the name at the IP

If the domain was bought elsewhere, first bring its DNS to Route 53:

1. In Route 53, create a **public hosted zone** for your domain.
2. Copy the four `NS` entries Route 53 gives the zone.
3. At your domain seller, replace the domain's nameservers with those four. It
   can take minutes to a few hours to take effect.

Then open the hosted zone and add the record that connects the name to the
server — the name people type and the public IP from step 4:

| Record | Type | Value |
| ------ | ---- | ----- |
| `admin.example.com` | `A` | the static public IP copied in step 4 |
| `api.example.com` *(optional)* | `A` | the same public IP (the `/marsquakes-api/` address prefix makes a separate name unnecessary) |

Replace `admin.example.com` with your own name. If the system will instead sit
behind an AWS load balancer or CDN, ask your agent before adding records — that
case uses a different kind of record.

## 7. Confirm the name points at the server

Records usually take effect within about ten minutes. Ask your agent to check:

> **Say this**
>
> Check whether my new domain name resolves to the server's public IP address
> yet. Tell me what address it currently points at.

**What you should see:** the agent reporting the domain points at the same IP as
the Lightsail page. If it points at nothing or at the wrong address after an
hour, say: "The domain still does not point at the server — check the record and
the nameserver settings and tell me what to fix."

Later, once the system is deployed, do the real-world test yourself: open the
domain on a phone using mobile data (not the local Wi-Fi) — proving the name,
the firewall and the server all work for an actual visitor.

## 8. Get the padlock (HTTPS certificate)

A **certificate** is a small file the edge server shows to every visitor to
prove the site is really yours; browsers answer with the padlock and the
`https://` prefix. Without one, browsers label the page "Not secure" and may
refuse to send passwords.

A certificate is only possible at this point — after the site opens over the
domain — because by now the name resolves to this server and is yours to
control, which is exactly what proving ownership requires. In AWS you obtain a
certificate from **AWS Certificate Manager (ACM)**. It offers a free and a
paid public certificate, and only the paid one can reach your edge nginx:

| Certificate | Cost | Type | Lifetime | Use for this project |
| ----------- | ---- | ---- | -------- | -------------------- |
| Standard public certificate | free | DV | renewed automatically by ACM | cannot be exported — attach it only to an ALB, CloudFront or API Gateway, which run HTTPS themselves |
| Exportable public certificate (requested after June 17, 2025) | charged at issue and renewal | DV | 395 days | exported as PEM, the private key encrypted under a passphrase you choose — this is the kind the edge nginx needs |

### Where the files go

The certificate files live in one fixed directory on the host:

`apps/web-admin/certs/`

That directory is git-ignored, so the keys are never committed. It is mounted
read-only into the edge container at `/etc/nginx/certs`, where
`edge-nginx.ssl.conf` reads exactly these two **PEM** files — plain Base64 text
starting with `-----BEGIN ...-----`:

- `fullchain.pem` — your certificate followed by the issuer's intermediate
  certificate (the full chain), used for `ssl_certificate`.
- `privkey.pem` — the unencrypted private key, used for `ssl_certificate_key`.

The ACM export gives you the certificate chain, the certificate and an
encrypted private key. Rename the chain to `apps/web-admin/certs/fullchain.pem`,
and decrypt the exported private key into
`apps/web-admin/certs/privkey.pem` before nginx can use it — give your agent
the passphrase in that one step rather than storing it anywhere. Never upload
the files back into a console.

The certificate is no good as a file on its own: the edge nginx has to be shown
where it is, publish port 443, and send plain visitors to `https://`. A complete
ready-made configuration — the same routing as today plus the redirect and the
`ssl_certificate` lines — is the file `apps/web-admin/edge-nginx.ssl.conf.example`
inside the project repository (copy it to `edge-nginx.ssl.conf`, replace the
example domain, and mount it). The firewall already has 443 open from step 3.
Give the domain to your agent and say:

> **Say this**
>
> My website now opens at my domain over plain HTTP. Request an exportable
> public certificate for that domain in AWS Certificate Manager, export it, and
> put the chain at `apps/web-admin/certs/fullchain.pem` and the decrypted
> private key at `apps/web-admin/certs/privkey.pem`. Make the edge server use
> them on port 443, redirect plain addresses to https, and renew the certificate
> before its 395 days run out. Do not change how the pages and the backend
> work. Tell me when a fresh visitor sees the padlock.

### If you already exported the certificate

You may instead have requested and exported the certificate yourself in the ACM
console. Do not paste its contents into the chat — the key file is a secret, and
anything pasted in can end up in a log. Put the files the export gave you into
the fixed directory, renamed exactly as the edge config expects:

- `apps/web-admin/certs/fullchain.pem` — the certificate chain
- `apps/web-admin/certs/privkey.pem` — the private key, decrypted from the
  exported encrypted key

The directory is already git-ignored. Then give your agent only the domain, and
say:

> **Say this**
>
> I already exported an HTTPS certificate for my domain from ACM — the chain is
> at `apps/web-admin/certs/fullchain.pem` and the private key is at
> `apps/web-admin/certs/privkey.pem`. Make the edge server use them on port 443,
> redirect plain addresses to https, and renew the certificate before its 395
> days run out. Do not change how the pages and the backend work, and do not put
> the key into version control. Tell me when a fresh visitor sees the padlock.

**What you should see:** in both cases, the agent reporting the certificate is
installed, and opening the domain yourself showing `https://` with a closed
padlock and no warning. If the page shows a warning or the padlock never
appears, say: "The padlock is not showing for a fresh visitor — check whether
the certificate failed to be issued, is not where the edge server looks for it,
or has expired, and tell me which."
