// hooks/useDeleteProduct.ts
import { useMutation } from '@tanstack/react-query';
import supabase from '../mocks/supabase'; // Adjust the import based on your project structure

const deleteStock = async (productId: number) => {
    const { error } = await supabase
        .from('stock') // Adjust the table name as necessary
        .delete()
        .eq('id', productId);

    if (error) {
        throw new Error(error.message);
    }
};

export const useDeleteProduct = () => {

    return useMutation({
        mutationFn: deleteStock,
        onSuccess: () => {
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        },
    });
};
