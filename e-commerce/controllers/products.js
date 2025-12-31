export const  createProduct = async (req, res) => {
    try {
        
    } catch (error) {
        if (error.code === 11000) {
        return res.status(409).json({ 
        error: "Product with this name already exists" 
    });
    }
    else {
        console.log("there was an error ")
    }
}
}
