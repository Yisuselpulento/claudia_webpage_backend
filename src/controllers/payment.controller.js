import Pack from "../models/pack.model.js"
import { preferenceClient, paymentClient } from "../config/mercadopago.js"

export const createPreference = async (req, res) => {

  const { items } = req.body

  try {

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No hay items para procesar el pago"
      })
    }

    /* obtener ids */

    const packIds = items.map(item => item._id)

    /* buscar packs reales en DB */

    const packs = await Pack.find({
      _id: { $in: packIds },
      isActive: true
    })

    if (packs.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Packs no encontrados"
      })
    }

    /* crear items seguros */

    const mpItems = packs.map(pack => ({

      id: pack._id.toString(),
      title: pack.title,
      quantity: 1,

      unit_price: pack.offer?.isActive
        ? Number(pack.offer.price)
        : Number(pack.price),

      currency_id: "CLP"

    }))

    const preference = await preferenceClient.create({
      body: {

        items: mpItems,

        metadata: {
          packs: packs.map(pack => pack._id.toString())
        },

        back_urls: {
          success: `${process.env.CLIENT_URL}/success`,
          failure: `${process.env.CLIENT_URL}/failure`,
          pending: `${process.env.CLIENT_URL}/pending`
        }

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

export const verifyPayment = async (req, res) => {
  const { paymentId } = req.params;

  try {
    if (!paymentId) {
      return res.status(400).json({ success: false, message: "Payment ID requerido" });
    }

    const payment = await paymentClient.get({ id: paymentId });

    if (payment.status !== "approved") {
      return res.status(400).json({ success: false, message: "Pago no aprobado" });
    }

    const packIds = payment.metadata?.packs || [];
    
    // Obtener los packs completos de MongoDB
    const packsData = await Pack.find({ _id: { $in: packIds } });

    return res.status(200).json({
      success: true,
      message: "Pago verificado correctamente",
      packsData
    });

  } catch (error) {
    console.error("Error en verifyPayment:", error);
    return res.status(500).json({ success: false, message: "Error verificando el pago" });
  }
};