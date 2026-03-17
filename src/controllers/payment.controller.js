import { preferenceClient } from "../config/mercadopago.js"

export const createPreference = async (req, res) => {

  const { items } = req.body

  try {

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No hay items para procesar el pago"
      })
    }

    const mpItems = items.map(item => ({
      id: item._id,
      title: item.title,
      quantity: 1,
      unit_price: Number(item.offer?.isActive ? item.offer.price : item.price),
      currency_id: "CLP"
    }))

    const preference = await preferenceClient.create({
      body: {
        items: mpItems,
        back_urls: {
          success: `${process.env.CLIENT_URL}/success`,
          failure: `${process.env.CLIENT_URL}/failure`,
          pending: `${process.env.CLIENT_URL}/pending`
        },
      /*   auto_return: "approved" */
      }
    })

    return res.status(201).json({
      success: true,
      message: "Preferencia creada correctamente",
      init_point: preference.init_point
    })

  } catch (error) {

    console.error("Error en createPreference:", error)

    return res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    })

  }
}