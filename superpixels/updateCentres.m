function C = updateCentres(im, label, k)

    height = size(im, 1);
    width = size(im, 2);
    CCount = zeros(k, 1);
    C = zeros(k, 5); % reset cluster centres
    
    for i = 1:height
        for j = 1:width          
            C(label(i,j), :) = C(label(i,j), :) + [reshape(im(i,j,:), 1, 3), i, j];
            CCount(label(i, j)) = CCount(label(i, j)) + 1;
        end
    end
    
    %%
    % Divide values to obtain mean
    for row_count = 1:size(C,1)
        if CCount(row_count)~= 0
            C(row_count, :) = C(row_count, :)/CCount(row_count);
        end
    end
    C(:, 4:5) = round(C(:, 4:5)); % round off the index so they are integers    
end