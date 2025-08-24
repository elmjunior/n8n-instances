# Adicionando Novos Clientes ao Cloudflare Tunnel

Guia rápido para adicionar novas instâncias n8n ao tunnel existente `n8n-clients`.

## ➕ Adicionando Novo Cliente

### 1. Editar configuração do tunnel

```bash
sudo nano /etc/cloudflared/config.yml
```

### 2. Adicionar nova entrada no ingress

Adicione uma nova linha antes da linha `- service: http_status:404`:

```yaml
tunnel: b7deaee6-0203-4176-97a6-6f9b1b3bb09d
credentials-file: /home/junior/.cloudflared/b7deaee6-0203-4176-97a6-6f9b1b3bb09d.json

ingress:
  - hostname: n8n-manager.primata.digital
    service: http://localhost:3000
  - hostname: construtora-pro-n8n.primata.digital
    service: http://localhost:5601
  - hostname: novo-cliente.primata.digital
    service: http://localhost:NOVA_PORTA
  - service: http_status:404
```

**Substitua:**

- `novo-cliente` pelo nome do cliente
- `NOVA_PORTA` pela porta onde roda a instância n8n do cliente

### 3. Configurar DNS para o novo cliente

```bash
cloudflared tunnel route dns n8n-clients novo-cliente.primata.digital
```

### 4. Reiniciar o serviço

```bash
sudo systemctl restart cloudflared
```

### 5. Verificar se funcionou

```bash
# Ver status do serviço
sudo systemctl status cloudflared

# Testar acesso
curl -I https://novo-cliente.primata.digital/

# Ver logs em tempo real
sudo journalctl -u cloudflared -f
```

## 🔍 Verificações Importantes

### Antes de adicionar o cliente:

1. **Confirmar que a instância n8n está rodando:**

   ```bash
   sudo netstat -tlnp | grep PORTA
   curl http://localhost:PORTA/
   ```

2. **Verificar se a porta não está em conflito:**
   ```bash
   sudo netstat -tlnp | grep :NOVA_PORTA
   ```

### Após adicionar:

1. **DNS pode levar alguns minutos para propagar**
2. **Verificar logs para confirmar configuração:**
   ```bash
   sudo journalctl -u cloudflared -n 20
   ```
3. **Testar no navegador:** `https://novo-cliente.primata.digital`

## 🛠️ Troubleshooting Rápido

- **404 Error:** Verificar se a porta está correta no config.yml
- **DNS não resolve:** Aguardar propagação ou verificar se a rota foi criada
- **Tunnel não conecta:** Verificar logs com `sudo journalctl -u cloudflared -f`

---

**Tunnel atual:** `n8n-clients` (ID: `b7deaee6-0203-4176-97a6-6f9b1b3bb09d`)  
**Usuário:** `junior`
