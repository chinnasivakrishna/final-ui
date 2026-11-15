module.exports = {
  findCustomerByGoogleOrEmail: `
    SELECT id, org_code, name, email, mobile, avatar, auth_provider, google_id, status, created_at
    FROM tb_web_customers
    WHERE google_id = ? OR email = ?
    LIMIT 1
  `,

  findCustomerById: `
    SELECT id, org_code, name, email, mobile, avatar, auth_provider, google_id, status, created_at
    FROM tb_web_customers
    WHERE id = ?
    LIMIT 1
  `,

  createCustomer: `
    INSERT INTO tb_web_customers (
      org_code, name, email, avatar, auth_provider, google_id, email_verified, status, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, 'google', ?, 1, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    )
  `,

  updateCustomerLogin: `
    UPDATE tb_web_customers
    SET avatar = COALESCE(?, avatar),
        google_id = COALESCE(google_id, ?),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `,

  updateCustomerProfile: `
    UPDATE tb_web_customers
    SET name = COALESCE(?, name),
        mobile = COALESCE(?, mobile),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `,

  // Cart Queries
  getCartItems: `
    SELECT c.id, c.customer_id, c.pdt_id, c.variant_id, c.qty, c.created_at, c.updated_at,
           p.pdt_code AS product_code, p.product AS product_name,
           pi.price AS product_price, p.primary_img AS product_image,
           v.var_code, v.name AS variant_name, v.colour AS variant_color, v.price AS variant_price, v.primary_img AS variant_image
    FROM tb_web_cart c
    LEFT JOIN tb_pdt_products p ON c.pdt_id = p.id
    LEFT JOIN tb_pdt_product_info pi ON p.id = pi.pdt_id
    LEFT JOIN tb_pdt_variants v ON c.variant_id = v.id
    WHERE c.customer_id = ?
    ORDER BY c.updated_at DESC
  `,

  findCartItem: `
    SELECT id, qty
    FROM tb_web_cart
    WHERE customer_id = ? AND pdt_id = ? AND (variant_id = ? OR (variant_id IS NULL AND ? IS NULL))
    LIMIT 1
  `,

  insertCartItem: `
    INSERT INTO tb_web_cart (customer_id, pdt_id, variant_id, qty, created_at, updated_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `,

  updateCartQty: `
    UPDATE tb_web_cart
    SET qty = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND customer_id = ?
  `,

  deleteCartItem: `
    DELETE FROM tb_web_cart
    WHERE id = ? AND customer_id = ?
  `,

  clearCart: `
    DELETE FROM tb_web_cart
    WHERE customer_id = ?
  `,

  // Wishlist Queries
  getWishlistItems: `
    SELECT w.id, w.customer_id, w.pdt_id, w.variant_id, w.created_at,
           p.pdt_code AS product_code, p.product AS product_name,
           pi.price AS product_price, p.primary_img AS product_image,
           v.var_code, v.name AS variant_name, v.colour AS variant_color, v.price AS variant_price
    FROM tb_web_wishlist w
    LEFT JOIN tb_pdt_products p ON w.pdt_id = p.id
    LEFT JOIN tb_pdt_product_info pi ON p.id = pi.pdt_id
    LEFT JOIN tb_pdt_variants v ON w.variant_id = v.id
    WHERE w.customer_id = ?
    ORDER BY w.created_at DESC
  `,

  findWishlistItem: `
    SELECT id
    FROM tb_web_wishlist
    WHERE customer_id = ? AND pdt_id = ? AND (variant_id = ? OR (variant_id IS NULL AND ? IS NULL))
    LIMIT 1
  `,

  insertWishlistItem: `
    INSERT INTO tb_web_wishlist (customer_id, pdt_id, variant_id, created_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
  `,

  deleteWishlistItem: `
    DELETE FROM tb_web_wishlist
    WHERE customer_id = ? AND (id = ? OR pdt_id = ?)
  `,

  // Recently Viewed Queries (Strictly Last 10 items)
  getRecentlyViewed: `
    SELECT r.id, r.customer_id, r.pdt_id, r.viewed_at,
           p.pdt_code AS product_code, p.product AS product_name,
           pi.price AS product_price, p.primary_img AS product_image
    FROM tb_web_recently_viewed r
    LEFT JOIN tb_pdt_products p ON r.pdt_id = p.id
    LEFT JOIN tb_pdt_product_info pi ON p.id = pi.pdt_id
    WHERE r.customer_id = ?
    ORDER BY r.viewed_at DESC
    LIMIT 10
  `,

  upsertRecentlyViewed: `
    INSERT INTO tb_web_recently_viewed (customer_id, pdt_id, viewed_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON DUPLICATE KEY UPDATE viewed_at = CURRENT_TIMESTAMP
  `,

  trimRecentlyViewed: `
    DELETE FROM tb_web_recently_viewed
    WHERE customer_id = ?
      AND id NOT IN (
        SELECT id FROM (
          SELECT id FROM tb_web_recently_viewed
          WHERE customer_id = ?
          ORDER BY viewed_at DESC
          LIMIT 10
        ) AS keep_last_10
      )
  `,

  clearRecentlyViewed: `
    DELETE FROM tb_web_recently_viewed
    WHERE customer_id = ?
  `
};
